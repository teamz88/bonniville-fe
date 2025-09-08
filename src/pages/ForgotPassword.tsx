import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { authApi } from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword({ email });
      setIsSuccess(true);
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.response?.data?.email) {
        errorMessage = error.response.data.email[0];
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-md">
          {/* Logo/Brand section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center overflow-hidden bg-white rounded-xl mb-4 shadow-lg">
              <img src='/bon.png' alt='logo' className='w-full h-16'/>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Check Your Email
            </h1>
            <p className="text-gray-600 mt-2">We've sent you a password reset link</p>
          </div>

          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Email Sent
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Password reset instructions have been sent to your email
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Reset link sent to <strong>{email}</strong></span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Check your inbox and spam folder</p>
                <p>• Click the reset link in the email</p>
                <p>• The link will expire in 24 hours</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Link to="/login" className="w-full">
                <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
              
              <div className="text-center text-sm text-gray-600">
                Didn't receive the email?{' '}
                <button 
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="text-primary hover:text-primary-700 font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center overflow-hidden bg-white rounded-xl mb-4 shadow-lg">
            <img src='/bon.png' alt='logo' className='w-full h-16'/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password?
          </h1>
          <p className="text-gray-600 mt-2">Enter your email to reset your password</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Reset Password
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              We'll send you a link to reset your password
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-error rounded-full"></div>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Reset Link
                  </div>
                )}
              </Button>

              <Link to="/login" className="w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;