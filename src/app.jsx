import React from 'react';
import FileUploadProgress from 'react-fileupload-progress';
import superagent from 'superagent'
import Progress from 'react-progressbar'
import AlertContainer from 'react-alert';
import '../styles/index.scss';
import '../styles/bootstrap.min.css';
var UploadScript = require("../resources/upload.sh");

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      time: 10000,
      transition: 'scale'
    };

    this.hostname = "192.168.1.112:8081"
    this.state = {"uploadAttempted": false}
  }

  componentDidMount() {
    new Clipboard('.copyBtn');
  }

  onUpload = (e) => {
    e.preventDefault();
    this.setState({"uploadError": false, "uploadComplete": false, "uploadAttempted": true})

    var form = document.getElementById("upload-file"),
        fd  = new FormData(form),
        self = this;

    if (document.getElementById("upload-file").file.value.length == 0) {
      this.msg.show('Please select a file to upload', {
        type: 'error'
      });
      return
    }

    superagent.post('/')
      .on('progress', function(e) { self.setState({"uploadProgress": e.percent})})
      .send(fd)
      .end(function(err, response) {
        self.setState({"uploadProgress": 0})
        if (err) {
          self.msg.show('Error uploading: ' + response.text, {
            type: 'error'
          });
        } else {
          var downloadJSON = JSON.parse(response.text)

          self.setState({"download_id": downloadJSON["id"],
                         "delete_id": downloadJSON["delete_id"]})

          self.setState({"uploadComplete": true})
        }
      });
  }

  render() {
    return (
      <div id="parent">
        <div id="header">
          <h1> super simple file sharing </h1>
        </div>

        <div>
          <form id="upload-file">
            <input name="file" type="file" required />
            <button id="singlebutton" name="singlebutton" className="btn btn-primary" onClick={this.onUpload}>Upload</button>
          </form>
          <AlertContainer ref={a => this.msg = a} {...this.alertOptions} />

          {this.state.uploadProgress > 0 &&
            <div id="progressContainer">
              <div id="progressbar" style={{width: this.state.uploadProgress + "%"}}>
                <div></div>
              </div>
            </div>
          }

          {this.state.uploadComplete &&
          <form>
            <fieldset id="upload-info">
              <div className="inner-addon right-addon">
                <label htmlFor="downloadField">Download URL</label>
                <input type="text" value={"http://" + this.hostname + "/" + this.state.download_id} id="downloadURL" readOnly />
                <button className="copyBtn" data-clipboard-target="#downloadURL" onClick={(e) => e.preventDefault()}>
                  <i id="downloadURL" className="material-icons copy-download-url-icon">content_copy</i>
                </button>
              </div>
              <div className="inner-addon right-addon">
                <label htmlFor="deleteField">Delete file with cURL </label>
                <input type="text" value={"curl -X DELETE http://" + this.hostname + "/" + this.state.download_id + "/" + this.state.delete_id} id="deleteURL" readOnly />
                <button className="copyBtn" data-clipboard-target="#deleteURL" onClick={(e) => e.preventDefault()}>
                  <i id="deleteURL" className="material-icons copy-download-url-icon">content_copy</i>
                </button>
              </div>
            </fieldset>
          </form>
          }

          {!this.state.uploadAttempted &&
          <div>
            <div className="center">
              <img src="https://storage.googleapis.com/website-storage-app/intro.gif"></img>
            </div>

            <div className="center" id="infographics">
              <figure>
                <i className="material-icons">cloud_download</i>
                <figcaption> downloads <br/> available <br/> for 7 days </figcaption>
              </figure>

              <figure>
                <i className="material-icons">personal_video</i>
                <figcaption> upload directly <br/> from <a href={UploadScript}> shell </a></figcaption>
              </figure>

              <figure>
                <i className="material-icons">insert_drive_file</i>
                <figcaption> 10GB  <br/> file limit <br/> </figcaption>
              </figure>
            </div>
          </div>
          }
        </div>
     </div>
    )
  }
}
