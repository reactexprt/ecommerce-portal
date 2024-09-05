import React from 'react';
import { FacebookLogin } from 'react-facebook-login-lite';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/actions/authActions';
import api from '../services/api';
import '../pages/login/Login.css';

const FacebookSignin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSuccess = async (response) => {
        try {
            const accessToken = response.authResponse.accessToken;
            const backendResponse = await api.post('/auth/facebook', { accessToken });
            const data = backendResponse.data;
            dispatch(login(data.authToken, data.userId));
            navigate('/cart');
        } catch (error) {
            console.error('Facebook Sign-In Error:', error);
        }
    };

    const handleFailure = (error) => {
        console.error('Facebook login failed:', error);
        alert('Please try different option to Login!');
    };

    return (
        <div style={{}}>
            <FacebookLogin
                appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                version="v16.0"
                onSuccess={handleSuccess}
                onFailure={handleFailure}
            />
        </div>
    );
};

export default FacebookSignin;
