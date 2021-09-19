import React, { Component } from 'react';
import { getMidi, getMidiTempo } from '../api';
import Abcjs from "react-abcjs";
import firebase from 'firebase/compat/app';
import { getAuth } from 'firebase/auth';
import withFirebaseAuth from '../App.js';

class MusicPage extends Component {
  state = {
    file: null,
    melody: '',
    tempo: '',
    user: '',
    notes: '',
  }

  componentDidMount() {
    const auth = getAuth();
    const user = auth.currentUser;
    this.setState({ user });
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
    this.abcNotation();
  }

  abcNotation() {
    const melody = this.state.melody["notes"];
    const tempo = this.state.tempo;
    var notes = []; // note objects in form {note name + octave: value, note type: value, rest type: value}
    //console.log(melody);
    if(melody){
      const beat_duration = (1/tempo["overall_tempo"])*60;
      var time_sig = tempo["clicks_per_bar"]
      if (tempo["clicks_per_bar"]%2 == 0)
        time_sig = tempo["clicks_per_bar"]/2+"/4";
      else time_sig = time_sig+"/8";
      var key_sig = this.state.melody["key"];
      var abc_string = `X: 1\nT: your sheet\nM: ${time_sig}\nK: ${key_sig}\n|`;
      //console.log(key_sig);
      if(key_sig.length==6){
        key_sig = key_sig[0]+key_sig.substring(3);
      }else if(key_sig==7){
        key_sig = key_sig.substring(0,2)+key_sig.substring(4);
      }
      console.log(key_sig);
      var count = 0;
      var b_count = 0;
      for(var i = 0; i<melody.length; i++){
        console.log("count: "+count);
        if (count >= 8){
          count = 0;
          abc_string+="|";
          b_count +=1;
        }
        if (b_count == 4){
          abc_string+="\n";
          b_count = 0;
          count = 0;
        }
        var note_duration = melody[i]["duration"];
        var note_value = midi_to_note(Math.round(melody[i]["midi_pitch"])); //note name + octave
        var note_type;
        if(Math.abs(note_duration/beat_duration - 1) < Math.abs(note_duration/beat_duration - 0.75)){ //quarter
          note_type = 1;
          count+=2;
          abc_string+=`${note_value}2`;
          if (count == 4){
            abc_string+=" ";
          }
        }else if(Math.abs(note_duration/beat_duration - 0.75) < Math.abs(note_duration/beat_duration - 0.5)){ // doted eighth
          note_type = 0.75;
          count++;
          abc_string+=`${note_value}>`;
          if (count == 4)
            abc_string+=" ";
        }else if(Math.abs(note_duration/beat_duration - 0.5) < Math.abs(note_duration/beat_duration - 0.25)){ //eigth
          note_type = 0.5;
          count++;
          abc_string+=`${note_value}`;
          if (count == 4)
            abc_string+=" ";
        }else if(Math.abs(note_duration/beat_duration - 0.25) < Math.abs(note_duration/beat_duration)){ //sixteenth
          note_type = 0.25;
          count++;
          abc_string+=`${note_value}/2`;
          if (count == 4)
            abc_string+=" ";
        }else{
          note_type = 0;
        }

        var rest_type = 1 - note_type;
        // notes.push({"note": note_value, "note_type": note_type, "rest_type": rest_type});
      }
      console.log(abc_string);
      this.setState({ notes: abc_string });
    }
  }

  render() {
    const { melody,tempo, user } = this.state;
    const firebaseApp = firebase.apps[0];
    console.log(user);
    return (
      <div>
        { user
          ? <span>Hello, {user.displayName} </span>
          : <span>Hello, Guest</span>
        }
        <span>Upload Music File</span>
        <div className="panel-row">
          <input type="file" className="file" accept=".mp3" multiple={false} onChange={(event) => this.setState({ file: event.target.files[0] })} />
        </div>
        <button className="button" onClick={() => this.getMidi()}> Upload </button>
        {melody && <p> Key: {melody.key}, Tuning Frequency: {melody.tuning_frequency}</p>}
        {tempo && <p> Clicks per bar: {tempo.clicks_per_bar}, Overall Tempo: {tempo.overall_tempo} </p>}
        {this.state.notes && 
          <Abcjs
            abcNotation={this.state.notes}
            parserParams={{}}
            engraverParams={{ responsive: 'resize' }}
            renderParams={{ viewportHorizontal: true }}
          />
        }
      </div>
    );
  }

}
function midi_to_note(noteNum){
  var notes = "C C#D D#E F F#G G#A A#B ";
   var octv;
   var nt;
   octv = Math.floor(noteNum / 12) - 1;
   nt = notes.substring((noteNum % 12) * 2, (noteNum % 12) * 2 + 2);
   nt = nt.toString()+octv.toString();
   var n = nt[0];
   if (nt[1] == '#'){
     n+='^c';
   }
   if (octv==3){ //change note appropriately by octave
      n+=",";
    }else if(octv==5){
      n += n.toLowerCase();
    }else if(octv==6){
     n+=n.toLowerCase()+"\'";
    }
   return n;
}

export default MusicPage;