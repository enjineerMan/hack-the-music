import React, { Component } from 'react';
import {getMidi} from '../api';

class MusicPage extends Component {
    state = {
        file: null,
        data: '',
    }

    async getMidi() {
        const formData = new FormData();
        formData.append('input_file', this.state.file);
        formData.append('access_id', process.env.REACT_APP_SONIC_API);
        formData.append('format', 'json');
        const response = await getMidi(formData);
        console.log(response);
        this.setState({ data: response.melody_result });
    }

    render() {
        const { data } = this.state;
        return (
          <div>
            <span>Upload Music File</span>
            <div className="panel-row">
              <input type="file" className="file" accept=".mp3" multiple={false} onChange={(event) => this.setState({ file: event.target.files[0] })} />
            </div>
            <button className="button" onClick={() => this.getMidi()}> Upload </button>
            {data && <p> Key: {data.key}, Tuning Frequency: {data.tuning_frequency}</p>}
            {data ? data.notes.map(n =>
                <div key={n.volume}>
                    <p>Midi Pitch: {n.midi_pitch}</p>
                    <p>Duration: {n.duration}</p>
                </div>
            ) : ''}
          </div>
        );
      }
}
export default MusicPage;