import React from 'react';
import './Profile.css';
import axios from 'axios';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state ={
      userName: '',
      userImg: ''
    }
  }

  componentDidMount() {
    axios.get('/auth/me')
    .then(res => {
      this.setState({
        userName: res.data.user_name,
        userImg: res.data.img
      });
    });
  }

  render() {
    return (
      <div className="Profile">
        <img src={this.state.userimg} alt="Kaycee" />
        <h1>Hello {this.state.userName}</h1>
      </div>
    );
  }
}