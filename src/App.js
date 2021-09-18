import './App.css';
import MusicPage from './pages/music.js';

var accessId = 'f5eeb248-839b-4ac3-8fa3-a557e5c78a0e';
var taskUrl = 'process/reverb';
var parameters = { blocking: false, format: 'json', access_id: accessId };

// the values for these parameters were taken from the corresponding controls in the demo form
parameters['input_file'] = 'http://www.sonicAPI.com/music/solo_sax.mp3';
parameters['preset'] = 'medium_hall';
parameters['wetness'] = '0.2';
    
function onTaskStarted(data) {
    var fileId = data.file.file_id;
    
    // request task progress every 500ms
    var polling = setInterval(pollTaskProgress, 500);
   
    function pollTaskProgress() {
        $.ajax({ url: 'https://api.sonicAPI.com/file/status?file_id=' + fileId + '&access_id=' + accessId + '&format=json', 
                 crossDomain: true, success: function(data) {
            if (data.file.status == 'ready') {
                onTaskSucceeded(fileId);
                clearInterval(polling);
            } else if (data.file.status == 'working') {
                $('#result').text(data.file.progress + '% done');
            }
        }});
    }
}

function onTaskSucceeded(fileId) {
    // create HTML5 audio player
    var downloadUrl = 'https://api.sonicAPI.com/file/download?file_id=' + fileId + '&access_id=' + accessId + '&format=mp3-cbr';
    var audio = '<audio src="' + downloadUrl + '" controls="controls" autoplay="autoplay">';
    
    $('#result').html(audio);
}

function onTaskFailed(response) {
    var data = $.parseJSON(response.responseText);
    var errorMessages = data.errors.map(function(error) { return error.message; });
 
    $('#result').text('Task failed, reason: ' + errorMessages.join(','));
}

// start task when clicking on the "Start task" button
$(document).ready(function() {
    $('#start').click(function() {
    	// execute an HTTP GET using the task's URL, the parameters and callback functions defined above
        $.ajax({ url: 'https://api.sonicAPI.com/' + taskUrl, data: parameters, 
                 success: onTaskStarted, error: onTaskFailed, crossDomain: true });
    });
});

// some code that uses the library
function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
        <MusicPage></MusicPage>
      </header>
    </div>
  );
}

export default App;
