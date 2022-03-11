const admin = requiere('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

module.exports = {admin, db}