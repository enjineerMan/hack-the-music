import React, { Component } from 'react';
import {getMidi} from '../api';
import {getMidiTempo} from '../api';
import firebase from 'firebase/compat/app';
import { getAuth } from 'firebase/auth';
import withFirebaseAuth from '../App.js';

const auth = getAuth();
const user = auth.currentUser;

class MusicPage extends Component {
    state = {
        file: null,
        data: '',
    }

    async getMidi() {
      console.log("processing...");
        const formData = new FormData();
        formData.append('input_file', this.state.file);
        formData.append('access_id', process.env.REACT_APP_SONIC_API);
        formData.append('format', 'json');
        const response = await getMidi(formData);
        const tempo = await getMidiTempo(formData);
        console.log(response);
        console.log(tempo);
        this.setState({ melody: response.melody_result, tempo: tempo.auftakt_result });
    }

    render() {
      const { melody,tempo } = this.state;
      const firebaseApp = firebase.apps[0];
        console.log(user);
            
        return (
          <div>
            { user
                ? <span>Hello, {user.displayName} </span>
                : <span>Hello, User</span>
            }
            <span>Upload Music File</span>
            <div className="panel-row">
              <input type="file" className="file" accept=".mp3" multiple={false} onChange={(event) => this.setState({ file: event.target.files[0] })} />
            </div>
            <button className="button" onClick={() => this.getMidi()}> Upload </button>
            {melody && <p> Key: {melody.key}, Tuning Frequency: {melody.tuning_frequency}</p>}
            {tempo && <p> Clicks per bar: {tempo.clicks_per_bar}, Overall Tempo: {tempo.overall_tempo} </p>}
          </div>
        );
    }

    componentDidUpdate(){
      const data = this.state.data["notes"];
      var midi_notes = [];
      //console.log("does it get here")
      console.log(data);
      if(data){
        for(var i = 0; i<data.length; i++){
          midi_notes.push(midi_to_note(Math.round(data[i]["midi_pitch"])));
          console.log(Math.round(data[i]["midi_pitch"]));
        }
        console.log(midi_notes);
      }
      
    }

}
function midi_to_note(noteNum){
  var notes = "C C#D D#E F F#G G#A A#B ";
   var octv;
   var nt;
   octv = Math.floor(noteNum / 12) - 1;
   nt = notes.substring((noteNum % 12) * 2, (noteNum % 12) * 2 + 2);
   return nt.toString()+octv.toString();
}
export default MusicPage;