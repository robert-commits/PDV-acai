const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const crypto = require('crypto');

initializeApp();
const db = getFirestore();
const REGION = 'southamerica-east1';

function requireAuth(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'Entre no PDV para continuar.');
  }
  return request.auth.uid;
}
function tokenId(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

exports.registerDevice = onCall({ region: REGION, maxInstances: 5 }, async (request) => {
  const uid = requireAuth(request);
  const token = String(request.data?.token || '').trim();
  const deviceName = String(request.data?.deviceName || 'Dispositivo web').slice(0, 60);
  if (token.length < 80 || token.length > 4096) {
    throw new HttpsError('invalid-argument', 'Token FCM inválido. Gere novamente no aparelho.');
  }
  const id = tokenId(token);
  await db.collection('pushDevices').doc(id).set({
    token,
    uid,
    deviceName,
    platform: String(request.data?.platform || 'web').slice(0, 20),
    enabled: true,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  }, { merge: true });
  return { ok: true, deviceId: id, message: 'Dispositivo cadastrado no ambiente de testes.' };
});

exports.sendTestPush = onCall({ region: REGION, maxInstances: 2 }, async (request) => {
  const uid = requireAuth(request);
  const adminDoc = await db.collection('pushTestAdmins').doc(uid).get();
  if (!adminDoc.exists || adminDoc.data()?.active !== true) {
    throw new HttpsError('permission-denied', 'Este usuário ainda não está autorizado como administrador do teste.');
  }
  const snap = await db.collection('pushDevices').where('enabled', '==', true).get();
  const docs = snap.docs;
  if (!docs.length) return { sentCount: 0, message: 'Nenhum dispositivo cadastrado.' };
  let sentCount = 0;
  const invalid = [];
  for (let i = 0; i < docs.length; i += 500) {
    const batch = docs.slice(i, i + 500);
    const tokens = batch.map(d => d.data().token).filter(Boolean);
    if (!tokens.length) continue;
    const response = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: 'Açaí Obrigatório · Teste remoto',
        body: 'Push remoto recebido! O Firebase conseguiu alcançar este dispositivo.'
      },
      data: { type: 'test' },
      webpush: { notification: { icon: './icon-192.png', badge: './icon-192.png' } }
    });
    sentCount += response.successCount;
    response.responses.forEach((r, index) => {
      if (!r.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(r.error?.code)) invalid.push(batch[index].ref);
    });
  }
  if (invalid.length) {
    const batch = db.batch();
    invalid.forEach(ref => batch.set(ref, { enabled: false, disabledAt: FieldValue.serverTimestamp() }, { merge: true }));
    await batch.commit();
  }
  return { sentCount, deviceCount: docs.length, invalidCount: invalid.length };
});
