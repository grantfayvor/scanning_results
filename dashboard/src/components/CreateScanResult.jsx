import React, { Component } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import axios from "axios";
import Modal from "./Modal";
import Toast from "./Toast";
import FindingsForm from "./FindingsForm";
import '../App.css';

export default class CreateScanResult extends Component {

  constructor(props) {
    super(props);
    let now = new Date();
    this.state = {
      finding: {
        type: "",
        ruleId: "",
        location: "",
        metadata: ""
      },
      findingsModal: false,
      findings: [],
      repositoryName: "",
      status: -1,
      queuedAt: now,
      scanningAt: now,
      finishedAt: now,
      showToast: false,
      toastTitle: "",
      toastMessage: ""
    };

    this.handleModalInputChange = this.handleModalInputChange.bind(this);
    this.handleModalChanges = this.handleModalChanges.bind(this);
    this.addFindingsData = this.addFindingsData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  handleChange = (prop, value) => {
    this.setState({ [prop]: value });
  };

  handleInputChange = prop => ({ target: { value } }) => {
    this.handleChange(prop, value);
  };

  handleModalChanges(prop) {
    return value => {
      let finding = Object.assign({}, this.state.finding, {
        [prop]: value
      });
      this.setState({ finding });
    };
  };

  handleModalInputChange(prop) {
    return ({ target: { value } }) => {
      this.handleModalChanges(prop)(value);
    };
  };

  addFindingsData() {
    let finding = Object.assign({}, this.state.finding);
    if (typeof finding.location === "string") finding.location = JSON.parse(finding.location);
    if (typeof finding.metadata === "string") finding.metadata = JSON.parse(finding.metadata);
    this.setState({
      findings: this.state.findings.concat(finding),
      finding: {
        type: "",
        ruleId: "",
        location: "",
        metadata: ""
      }
    }, () => {
      this.toggleModal("findingsModal")(false);
    });
  };

  toggleToast = () => {
    this.setState({ showToast: !this.state.showToast });
  };

  showToast = (title, message) => {
    this.setState({ toastTitle: title, toastMessage: message, showToast: true });
  };

  submitScanResult = () => {
    axios.post(`${this.props.config.webserver.uri}/api/results`, { result: this.state })
      .then(res => res.data)
      .then(data => window.location.href = "/")
      .catch(error => {
        let title, message = "";
        if (error.response && error.response.data && error.response.data.err) {
          title = error.response.data.err.name;
          message = error.response.data.err.message;
        } else {
          title = error.name;
          message = error.message;
        }
        this.showToast(title, message);
      });
  };

  toggleModal(title) {
    return active => {
      this.setState({ [title]: active });
    }
  }

  render() {

    return (
      <div className="App-header">
        {
          this.state.showToast && <Toast active={this.state.showToast} title={this.state.toastTitle} message={this.state.toastMessage} toggle={this.toggleToast} />
        }

        <Form style={{ width: "30%" }}>
          <Form.Group controlId="repositoryName">
            <Form.Control value={this.state.repositoryName} onChange={this.handleInputChange("repositoryName")} type="text" placeholder="Enter Repository Name" required />
          </Form.Group>
          <Form.Group controlId="status">
            <Form.Control value={this.state.status} onChange={this.handleInputChange("status")} as="select" required>
              <option value={-1} disabled>Select Status</option>
              <option value="Queued">Queued</option>
              <option value="In Progress">In Progress</option>
              <option value="Success">Success</option>
              <option value="Failure">Failure</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="queuedAt">
            <Form.Control value={this.state.queuedAt} onChange={this.handleInputChange("queuedAt")} type="date" placeholder="Queued Date" required />
          </Form.Group>
          <Form.Group controlId="scanningAt">
            <Form.Control value={this.state.scanningAt} onChange={this.handleInputChange("scanningAt")} type="date" placeholder="Scanning Date" required />
          </Form.Group>
          <Form.Group controlId="finishedAt">
            <Form.Control value={this.state.finishedAt} onChange={this.handleInputChange("finishedAt")} type="date" placeholder="Finished Date" required />
          </Form.Group>
          <Form.Group>
            <ListGroup>
              {
                this.state.findings.map((f, i) => <ListGroup.Item style={{ color: "black" }} key={i}>{`${f.type} - ${f.ruleId}`}</ListGroup.Item>)
              }
            </ListGroup>
          </Form.Group>
          <Form.Group controlId="addFindings">
            <Button variant="outline-info" onClick={() => this.toggleModal("findingsModal")(true)}>
              Add Finding
            </Button>
          </Form.Group>

          <Button variant="primary" onClick={this.submitScanResult}>
            Submit
          </Button>
        </Form>
        <Modal toggleModal={this.toggleModal("findingsModal")} active={this.state["findingsModal"]} title={"Enter Findings"} handleSubmit={this.addFindingsData}>
          <FindingsForm
            finding={this.state.finding}
            handleModalChanges={this.handleModalChanges}
            handleModalInputChange={this.handleModalInputChange}
          />
        </Modal>

      </div>
    )
  }
}