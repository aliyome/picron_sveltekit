import { firebaseConfig } from '$config/firebase';

import type firebase from 'firebase/app';

let _app: firebase.app.App;
export const app = async () => {
	if (!_app) {
		const firebase = await import('firebase/app').then((m) => m.default);
		_app = firebase.initializeApp(firebaseConfig);
	}
	return _app;
};

let _auth: firebase.auth.Auth;
export const auth = async () => {
	if (!_auth) {
		await app();
		await import('firebase/auth');
		_auth = _app.auth();
	}
	return _auth;
};

let _firestore: firebase.firestore.Firestore;
export const firestore = async () => {
	if (!_firestore) {
		await app();
		await import('firebase/firestore');
		_firestore = _app.firestore();
	}
	return _firestore;
};
