import React, { Component } from 'react';
import { getMidi, getMidiTempo } from '../api';
import Button from '../components/Button';
import Abcjs from "react-abcjs";
import firebase from 'firebase/compat/app';
import { getAuth } from 'firebase/auth';
import withFirebaseAuth from '../App.js';
import { getDatabase, ref, set } from "firebase/database";
import './music.css'

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

    async writeData(uid, displayName, abcString)
    {
        const db = getDatabase();
        set(ref(db, 'users/' + uid + Date.now()), {
        username: displayName,
        abcString: abcString
      });
    }

  async getMidi() {
    console.log("processing...");
    const formData = new FormData();
    formData.append('input_file', this.state.file);
    formData.append('access_id', process.env.REACT_APP_SONIC_API);
    formData.append('format', 'json');
    const response = await getMidi(formData);
    const tempo = await getMidiTempo(formData);
    this.setState({ melody: response.melody_result, tempo: tempo.auftakt_result });
    this.abcNotation();
    if (this.state.user != null)
        this.writeData(this.state.user.uid, this.state.user.displayName, this.state.notes);
  }

  abcNotation() {
    const melody = this.state.melody["notes"];
    const tempo = this.state.tempo;
    const user = this.state.user;
    var notes = []; // note objects in form {note name + octave: value, note type: value, rest type: value}
    if(melody){
      const beat_duration = (1/tempo["overall_tempo"])*60;
      var time_sig = tempo["clicks_per_bar"]
      if (tempo["clicks_per_bar"]%2 == 0)
        time_sig = tempo["clicks_per_bar"]/2+"/4";
      else time_sig = time_sig+"/8";
      var key_sig = this.state.melody["key"];
      if(key_sig.length==6){
        key_sig = key_sig[0].toUpperCase()+key_sig.substring(3);
      }else if(key_sig==7){
        key_sig = key_sig.substring(0,2).toUpperCase()+key_sig.substring(4);
      }
      var abc_string = `X: 1\nT: Your Sheet\nM: ${time_sig}\nK: ${key_sig}\n|`;
      var count = 0;
      var b_count = 0;
      for(var i = 0; i<melody.length; i++){
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
        notes.push({"note": note_value, "note_type": note_type});
      }
      console.log(abc_string);
      this.setState({ notes: abc_string });
    }
  }

  render() {
    const { melody,tempo, user, file } = this.state;
    return (
      <div className="MusicPage">
        { user
          ? <div className="name">Hello, {user.displayName} </div>
          : <div>Hello, Guest</div>
        } <br/>
        <label class="file"> <input type="file" accept=".mp3" multiple={false} onChange={(event) => this.setState({ file: event.target.files[0] })} /> Choose a track... </label>
        {file && <span className="mp3">{file.name}</span>}
        <button className="button" onClick={() => this.getMidi()}> Upload </button>
        {melody && <p> Key: {melody.key}, Tuning Frequency: {parseInt(melody.tuning_frequency)}</p>}
        {tempo && <p> Overall Tempo: {parseInt(tempo.overall_tempo)} </p>}
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
   nt = nt.toString();
   var n = nt[0];
   if (nt[1] == '#'){
     n='^'+n;
   }
   if (octv==3){ //change note appropriately by octave
      n+=",";
    }else if(octv==5){
      n = n.toLowerCase();
    }else if(octv==6){
     n=n.toLowerCase()+"\'";
    }
   return n;
}


export default MusicPage;