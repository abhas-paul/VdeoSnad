"use client"
import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  X,
  Users,
  Sparkles,
  Mail,
  Timer,
  CheckCircle,
  AlertCircle,
  Home,
  XCircle,
  CheckCircle2,
} from "lucide-react";

export default function ScheduleMeetingPage() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    description: '',
    datetime: '',
    timezone: 'Asia/Kolkata'
  });
  const [errors, setErrors] = useState({});

  // Load meetings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMeetings = localStorage.getItem('meetings');
      if (savedMeetings) {
        try {
          const parsedMeetings = JSON.parse(savedMeetings);
          setMeetings(parsedMeetings);
        } catch (error) {
          console.error('Error parsing saved meetings:', error);
          localStorage.removeItem('meetings');
        }
      }
    }
  }, []);

  // Save meetings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && meetings.length > 0) {
      try {
        localStorage.setItem('meetings', JSON.stringify(meetings));
      } catch (error) {
        console.error('Error saving meetings to localStorage:', error);
      }
    }
  }, [meetings]);

  // Generate unique ID for meetings
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Calculate time remaining for scheduled meetings
  const calculateTimeRemaining = (datetime) => {
    const now = new Date();
    const meetingTime = new Date(datetime);
    const diff = meetingTime - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Update meetings with time remaining
  useEffect(() => {
    const updateMeetings = () => {
      setMeetings(prevMeetings => 
        prevMeetings.map(meeting => {
          const timeRemaining = calculateTimeRemaining(meeting.datetime);
          const now = new Date();
          const meetingTime = new Date(meeting.datetime);
          
          return {
            ...meeting,
            timeRemaining,
            status: meetingTime <= now ? 'completed' : 'scheduled'
          };
        })
      );
    };

    updateMeetings();
    const interval = setInterval(updateMeetings, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.datetime) {
      newErrors.datetime = 'Date and time are required';
    } else {
      const selectedDate = new Date(formData.datetime);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.datetime = 'Please select a future date and time';
      }
    }
    
    return newErrors;
  };

  const sendReminderEmail = async (meeting) => {
    try {
      // Check if environment variables are available
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

      console.log('EmailJS Config:', {
        publicKey: publicKey ? 'Present' : 'Missing',
        serviceId: serviceId ? 'Present' : 'Missing',
        templateId: templateId ? 'Present' : 'Missing'
      });

      if (!publicKey || !serviceId || !templateId) {
        throw new Error('EmailJS configuration is missing. Please check your environment variables.');
      }

      // Initialize EmailJS with your public key
      emailjs.init(publicKey);

      const templateParams = {
        user_name: meeting.email.split('@')[0],
        reminder_title: meeting.title,
        reminder_time: new Date(meeting.datetime).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }),
        action_link: `${window.location.origin}/meeting/${meeting.id}`,
        to_email: meeting.email // Add recipient email
      };

      console.log('Sending email with params:', templateParams);

      // Send the email using EmailJS
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );

      console.log('EmailJS Response:', response);

      if (response.status === 200) {
        showToast(`Meeting scheduled! A reminder email has been sent to ${meeting.email}`);
        return true;
      } else {
        throw new Error(`Failed to send email: ${response.text}`);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      showToast(`Failed to send reminder email: ${error.message}`);
      return false;
    }
  };

  // Toast handler
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('There is an error in the form. Make sure to fill all the fields correctly.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newMeeting = {
        id: generateId(),
        ...formData,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        timeRemaining: calculateTimeRemaining(formData.datetime)
      };
      
      await sendReminderEmail(newMeeting);
      
      setMeetings(prev => [...prev, newMeeting]);
      
      setFormData({
        title: '',
        email: '',
        description: '',
        datetime: '',
        timezone: 'Asia/Kolkata'
      });
      setErrors({});
      setShowDialog(false);
      
      showToast('Meeting scheduled.');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      showToast('There is an error in the form. Make sure to fill all the fields correctly.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const deleteMeeting = (id) => {
    setMeetings(prev => {
      const updatedMeetings = prev.filter(meeting => meeting.id !== id);
      if (typeof window !== 'undefined') {
        if (updatedMeetings.length === 0) {
          localStorage.removeItem('meetings');
        } else {
          localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
        }
      }
      showToast('Scheduled meeting deleted.');
      return updatedMeetings;
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ${
          toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500/90 backdrop-blur-sm border border-green-400/50' 
              : 'bg-red-500/90 backdrop-blur-sm border border-red-400/50'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <XCircle className="w-5 h-5 text-white" />
            )}
            <span className="text-white font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <section className="fixed inset-0">
        <section className="absolute top-4 left-4 sm:top-20 sm:left-20 w-32 h-32 sm:w-72 sm:h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <section className="absolute bottom-4 right-4 sm:bottom-20 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <section className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[800px] sm:h-[800px] bg-gradient-radial from-blue-900/5 to-transparent rounded-full" />

        {/* Floating particles - Hidden on mobile */}
        <section className="absolute inset-0 hidden sm:block">
          {[
            { left: '10%', top: '20%', delay: '0s', duration: '3s' },
            { left: '20%', top: '40%', delay: '0.5s', duration: '3.5s' },
            { left: '30%', top: '60%', delay: '1s', duration: '4s' },
            { left: '40%', top: '80%', delay: '1.5s', duration: '3.2s' },
            { left: '50%', top: '30%', delay: '2s', duration: '3.8s' },
            { left: '60%', top: '50%', delay: '2.5s', duration: '3.3s' },
            { left: '70%', top: '70%', delay: '0.2s', duration: '3.7s' },
            { left: '80%', top: '90%', delay: '0.7s', duration: '3.4s' },
            { left: '90%', top: '10%', delay: '1.2s', duration: '3.6s' },
            { left: '95%', top: '30%', delay: '1.7s', duration: '3.9s' }
          ].map((particle, i) => (
            <section
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-bounce"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </section>
      </section>

      {/* Header */}
      <header className="relative z-10 text-center py-8 sm:py-16 px-4 max-w-5xl mx-auto">
        <section className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
          <section className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl opacity-50 animate-pulse" />
          <section className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
            <Sparkles className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 text-yellow-400 animate-spin" />
          </section>
        </section>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent mb-4 sm:mb-6 tracking-tight leading-tight px-2">
          Meeting Scheduler
        </h1>
      </header>

      {/* Schedule Button */}
      <section className="relative z-10 text-center mb-12 sm:mb-16 px-4">
        <button
          onClick={() => setShowDialog(true)}
          className="group cursor-pointer relative inline-flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105 border border-blue-500/30 w-full max-w-sm sm:max-w-none sm:w-auto"
        >
          <section className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl group-hover:blur-2xl transition-all duration-500" />
          <Plus className="relative w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-180 transition-transform duration-500" />
          <span className="relative">Schedule Meeting</span>
          <section className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        </button>
      </section>

      {/* Enhanced Empty State / Meetings List */}
      <section className="relative z-10 px-4 max-w-7xl mx-auto pb-16 sm:pb-20">
        {meetings.length === 0 ? (
          <section className="text-center py-16 sm:py-24">
            <section className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
              <section className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-full blur-2xl" />
              <section className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full p-6 sm:p-8 shadow-2xl">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
              </section>
            </section>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-200 mb-3 sm:mb-4 px-2">
              Your Dashboard Awaits
            </h3>
            <p className="text-base sm:text-xl text-slate-400 max-w-sm sm:max-w-md mx-auto leading-relaxed px-2">
              Create your first meeting and unlock the full potential of professional scheduling
            </p>

            {/* Feature cards preview */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-4xl mx-auto">
              {[
                { icon: Calendar, title: "Smart Scheduling", desc: "AI-powered time optimization" },
                { icon: Clock, title: "Global Timezones", desc: "Seamless international coordination" },
                { icon: MapPin, title: "Location Sync", desc: "Automatic venue suggestions" }
              ].map((feature, i) => (
                <section key={i} className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-105">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-semibold text-slate-200 text-sm sm:text-base">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">{feature.desc}</p>
                </section>
              ))}
            </section>
          </section>
        ) : (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-6 sm:mb-8 text-center">
              Scheduled Meetings ({meetings.length})
            </h2>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {meetings.map((meeting) => (
                <section key={meeting.id} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-blue-500/30 transition-all duration-300">
                  <section className="flex justify-between items-start mb-4">
                    <section className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">{meeting.title}</h3>
                      <p className="text-sm text-slate-400 mb-3">{meeting.description || 'No description provided'}</p>
                    </section>
                    <section className="flex items-center gap-2">
                      {meeting.status === 'scheduled' ? (
                        <Timer className="w-5 h-5 text-blue-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      <button
                        onClick={() => deleteMeeting(meeting.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 cursor-pointer h-4" />
                      </button>
                    </section>
                  </section>

                  <section className="space-y-2 text-sm">
                    <section className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(meeting.datetime).toLocaleString()}</span>
                    </section>
                    <section className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4" />
                      <span>{meeting.email}</span>
                    </section>
                    <section className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4" />
                      <span>{meeting.timezone}</span>
                    </section>
                  </section>

                  {meeting.status === 'scheduled' && meeting.timeRemaining && (
                    <section className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <section className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 font-mono text-sm">
                          Time remaining: {meeting.timeRemaining}
                        </span>
                      </section>
                    </section>
                  )}

                  {meeting.status === 'completed' && (
                    <section className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <section className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm">
                          Meeting schedule expired!
                        </span>
                      </section>
                    </section>
                  )}
                </section>
              ))}
            </section>
          </section>
        )}
      </section>

      {/* Dialog */}
      {showDialog && (
        <section className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <section className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={() => setShowDialog(false)} />

          <section className="relative bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-2xl border border-blue-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 w-full max-w-md sm:max-w-lg lg:max-w-2xl shadow-2xl text-white space-y-5 sm:space-y-8 transform transition-all duration-500 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
            <section className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl sm:rounded-3xl" />

            <header className="relative flex justify-between items-start">
              <section className="flex-1 pr-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  Schedule Meeting
                </h2>
                <p className="text-slate-400 mt-1 text-sm">Create your next important meeting</p>
              </section>
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="p-2 sm:p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 cursor-pointer sm:h-6" />
              </button>
            </header>

            <section className="relative">
              <label htmlFor="title" className="block text-sm font-semibold mb-3 text-slate-300">
                Meeting Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter meeting title..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full bg-slate-800/50 backdrop-blur-sm border ${errors.title ? 'border-red-500/50' : 'border-slate-600/50'} focus:border-blue-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white placeholder-slate-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </section>

            <section className="relative">
              <label htmlFor="email" className="block text-sm font-semibold mb-3 text-slate-300">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full bg-slate-800/50 backdrop-blur-sm border ${errors.email ? 'border-red-500/50' : 'border-slate-600/50'} focus:border-blue-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white placeholder-slate-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </section>

            <section className="relative">
              <label htmlFor="description" className="block text-sm font-semibold mb-3 text-slate-300">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Meeting details and agenda..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 focus:border-blue-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white placeholder-slate-400 resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <section className="relative">
                <label htmlFor="datetime" className="block text-sm font-semibold mb-3 text-slate-300">
                  Date & Time *
                </label>
                <input
                  id="datetime"
                  type="datetime-local"
                  value={formData.datetime}
                  onChange={(e) => handleInputChange('datetime', e.target.value)}
                  className={`w-full cursor-pointer bg-slate-800/50 backdrop-blur-sm border ${errors.datetime ? 'border-red-500/50' : 'border-slate-600/50'} focus:border-blue-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                />
                {errors.datetime && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.datetime}
                  </p>
                )}
              </section>

              <section className="relative">
                <label htmlFor="timezone" className="block text-sm font-semibold mb-3 text-slate-300">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full cursor-pointer bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 focus:border-blue-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <optgroup label="Popular Timezones">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </optgroup>
                  <optgroup label="Other Timezones">
                    <option value="UTC">UTC</option>
                  </optgroup>
                </select>
              </section>
            </section>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="relative cursor-pointer w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:via-slate-700 disabled:to-slate-800 text-white py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25 border border-blue-500/30 disabled:border-slate-500/30 disabled:cursor-not-allowed"
            >
              <section className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-lg sm:rounded-xl blur-lg sm:blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <section className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Schedule Meeting
                  </>
                )}
              </span>
            </button>
          </section>
        </section>
      )}

      {/* Home Button */}
      <section className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => router.push('/')}
          className="group cursor-pointer inline-flex items-center gap-2 bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-blue-500/30 hover:scale-105"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Go to Home</span>
        </button>
      </section>
    </main>
  );
}