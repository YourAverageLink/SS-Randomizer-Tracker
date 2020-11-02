import React from "react";
import Button from "react-bootstrap/cjs/Button";
import Modal from "react-bootstrap/cjs/Modal";

export default class ImportExport extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.state
    }
    render() {
        return (
            <div id={"ImportExport"}>
                <button variant="primary" onClick={this.export()} >Export Tracker</button>
                <button variant="primary" >
                    Import Tracker
                    <Modal id={"import"} title={"Please choose your file"}>
                        <input id={"fileInput"} ref={"fileInput"} type={"file"} accept={".json"} onChange={this.readFile}/>
                    </Modal>
                </button>
            </div>
        )
    }

    /*
    Initiates a download with the exported state, don't ask how it works, it simply does (hopefully)
     */
    export () {
        let filename = "SS-Rando-Tracker" + Date();
        let exportstring = JSON.stringify(this.state, undefined , "\t");
        const blob = new Blob([exportstring], {type: 'json'})
        const e = document.createEvent('MouseEvents'), a = document.createElement('a');
        a.download = filename + ".json";
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['json', a.download, a.href].join(':');
        e.initEvent('click');
        a.dispatchEvent(e);
    }

    import(text) {
        this.state = JSON.parse(text)
        return
    }

    readFile(event) {
        let file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = e => {
            if (!e.target) {
                return
            }
            this.import(e.target.result.toString());
            return;
        }
    }
}