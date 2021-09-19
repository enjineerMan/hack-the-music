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
        melody: '',
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
      console.log(melody);
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
      const melody = this.state.melody["notes"];
      const tempo = this.state.tempo;
      var notes = []; // note objects in form {note name + octave: value, note type: value, rest type: value}
      //console.log(melody);
      if(melody){
        const beat_duration = (1/tempo["overall_tempo"])*60;
        const beats_per_bar = tempo["clicks_per_bar"]/2;
        var key_sig = this.state.melody["key"];
        //console.log(key_sig);
        if(key_sig.length==6){
          key_sig = key_sig[0]+key_sig.substring(3);
        }else if(key_sig==7){
          key_sig = key_sig.substring(0,2)+key_sig.substring(4);
        }
        console.log(key_sig);
        for(var i = 0; i<melody.length; i++){
          var note_duration = melody[i]["duration"];
          var note_value = midi_to_note(Math.round(melody[i]["midi_pitch"])); //note name + octave
          var note_type;
          if(Math.abs(note_duration/beat_duration - 1) < Math.abs(note_duration/beat_duration - 0.75)){ //quarter
            note_type = 1;
          }else if(Math.abs(note_duration/beat_duration - 0.75) < Math.abs(note_duration/beat_duration - 0.5)){ // doted eighth
            note_type = 0.75;
          }else if(Math.abs(note_duration/beat_duration - 0.5) < Math.abs(note_duration/beat_duration - 0.25)){ //eigth
            note_type = 0.5;
          }else if(Math.abs(note_duration/beat_duration - 0.25) < Math.abs(note_duration/beat_duration)){ //sixteenth
            note_type = 0.25;
          }else{
            note_type = 0;
          }

          var rest_type = 1 - note_type;
          var time_sig = beats_per_bar.toString()+"/4";
          var abc_string = 
          `X: 1
          T: your sheet
          M: ${time_sig}
          K: ${key_sig}
          |`;
          notes.push({"note": note_value, "note_type": note_type, "rest_type": rest_type});
        }
        console.log(notes);
        //console.log(midi_notes);
        //console.log(tempo["overall_tempo"]);
        

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