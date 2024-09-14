import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import LogRocket from 'logrocket';
import { login } from '../redux/actions/authActions';
import api from '../services/api';
import '../pages/login/Login.css';

const FacebookSignin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [fbInitialized, setFbInitialized] = useState(false);

    // Load Facebook SDK and ensure initialization
    useEffect(() => {
        const loadFacebookSDK = () => {
            return new Promise((resolve) => {
                if (window.FB) {
                    window.FB.getLoginStatus(() => {
                        resolve(true);
                    });
                } else {
                    const script = document.createElement('script');
                    script.src = "https://connect.facebook.net/en_US/sdk.js";
                    script.async = true;
                    script.defer = true;
                    script.onload = () => {
                        window.FB.init({
                            appId: process.env.REACT_APP_FB_APP_ID,
                            cookie: true,
                            xfbml: true,
                            version: 'v16.0',
                        });
                        window.FB.getLoginStatus((response) => {
                            if (response.status === 'connected') {
                              resolve(true);
                            } else {
                              console.log('User not logged into Facebook');
                              resolve(false);
                            }
                        });
                    };
                    document.body.appendChild(script);
                }
            });
        };

        if (process.env.NODE_ENV === 'production') {
            loadFacebookSDK().then(() => {
                setFbInitialized(true);
            }).catch((error) => {
                console.error('Error loading FB SDK:');
            });
        }
    }, []);

    // Define an async function to process Facebook login
    const processFacebookLogin = async (accessToken) => {
        try {
            const backendResponse = await api.post('/auth/facebook', { accessToken });
            const data = backendResponse.data;
            dispatch(login(data.authToken, data.userId));

            if (process.env.NODE_ENV === 'production') {
                try {
                    LogRocket.startNewSession();
                    LogRocket.identify(data.userId, {
                        name: data.username,
                        email: data.email
                    });
                } catch (error) {
                    console.error('Error initializing LogRocket session:', error);
                    // Optionally, log the error to LogRocket as well
                    LogRocket.captureException(error);
                }
            }

            navigate('/cart');

        } catch (error) {
            console.error('Facebook Sign-In Error:', error);
            if (process.env.NODE_ENV === 'production') {
              LogRocket.captureException(error);
            }
        }
          
    };

    // Handle Facebook login
    const handleFacebookLogin = () => {
        if (fbInitialized && window.FB) {
            window.FB.login((response) => {
                if (response.authResponse) {
                    processFacebookLogin(response.authResponse.accessToken);
                } else {
                    console.error('User cancelled login or did not fully authorize.');
                }
            }, { scope: 'email' });
        } else {
            console.error('Facebook SDK is not initialized yet.');
        }
    };

    return (
        <button onClick={handleFacebookLogin} className="btn btn-facebook" disabled={!fbInitialized}>
            <FontAwesomeIcon icon={faFacebook} style={{ marginRight: '10px' }} />
            {fbInitialized ? 'Login with Facebook' : 'Loading Facebook...'}
        </button>
    );
};

export default FacebookSignin;
