import React from 'react'
import ReactDOM from 'react-dom/client'

import { unstable_HistoryRouter as HistoryRouter, Routes, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Provider, useDispatch, useSelector } from 'react-redux'

import Home from './views/Home'
import Profile from './views/Profile'
import Login from './views/Login'
import Register from './views/Register'
import EditProfile from './views/EditProfile'
import Navbar from './components/Navbar'
import CreatePost from './components/CreatePost'
import store from './store/index.js'
import './assets/css/tailwind.css'
import ForgotPasswordView from './views/ForgotPasswordView.jsx';
import ResetPasswordView from './views/ResetPasswordView.jsx';

import './api/request'

const history = createBrowserHistory({ window });

const root = ReactDOM.createRoot(
  document.getElementById("root")
);


root.render(
  <HistoryRouter history={history}>
    <Provider store={store} >
      <div>
        <Navbar />
        <CreatePost />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path=":username" element={<Profile />} />
          <Route path="register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/reset-password/:token" element={<ResetPasswordView />} />
          <Route path="login" element={<Login />} />
          <Route path="edit" element={<EditProfile />} />
        </Routes>
      </div>

    </Provider>
  </HistoryRouter>
);