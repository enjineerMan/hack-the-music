import './App.css';
import { Component } from 'react';
import { Redirect } from 'react-router-dom';
import MusicPage from './pages/music.js';
import withFirebaseAuth from 'react-with-firebase-auth'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import firebaseConfig from './firebaseConfig';

const app = firebase.initializeApp(firebaseConfig);

const firebaseAppAuth = app.auth();

const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

class App extends Component {
  render() {
    const {
      user,
      signOut,
      signInWithGoogle,
    } = this.props;

      return (
        <div className="App">
          <header className="App-header">
            <h1> Hack the Music </h1>
         { user
            ? <MusicPage/>
            : <p>Please sign in</p>
          }
          { user
            ? <button onClick={signOut}>Sign out</button> 
            : <button onClick={signInWithGoogle}>Sign in with Google</button>
          }
          </header>
          <div className="footer">
            <img src="http://www.sonicapi.com/download/logo_sonicAPI.png"/>
            <a href="http://www.sonicAPI.com" target="_blank">With use of SonicAPI</a>
          </div>
        </div>
      );
    }
}

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(App);
