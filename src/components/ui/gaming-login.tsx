'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Smartphone, Lock } from 'lucide-react';

interface LoginFormProps {
    onSubmit: (phone: string, password: string, remember: boolean) => void;
    isSubmitting?: boolean;
}

interface VideoBackgroundProps {
    videoUrl: string;
}

// VideoBackground Component
const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Video autoplay failed:", error);
            });
        }
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-black/50 z-10" />
            <video
                ref={videoRef}
                className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

// Main LoginForm Component
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isSubmitting = false }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(phone, password, remember);
    };

    return (
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-primary-gold/20">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 relative group">
                    <span className="absolute -inset-1 bg-gradient-to-r from-primary-gold/30 via-primary-purple/30 to-primary-gold/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
                    <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                        君悦SPA
                    </span>
                </h2>
                <p className="text-white/80 flex flex-col items-center space-y-1">
                    <span className="relative group cursor-default">
                        <span className="absolute -inset-1 bg-gradient-to-r from-primary-gold/20 to-primary-purple/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative inline-block">您的私人奢享空间</span>
                    </span>
                    <span className="text-xs text-white/50">
                        专业SPA技师在线预约
                    </span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Smartphone className="text-white/60" size={18} />
                    </div>
                    <input
                        type="tel"
                        placeholder="手机号"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary-gold/50 transition-colors"
                    />
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Lock className="text-white/60" size={18} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary-gold/50 transition-colors"
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="relative inline-block w-10 h-5 cursor-pointer" onClick={() => setRemember(!remember)}>
                            <input
                                type="checkbox"
                                id="remember-me"
                                className="sr-only"
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                            />
                            <div className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${remember ? 'bg-primary-gold' : 'bg-white/20'}`}>
                                <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${remember ? 'transform translate-x-5' : ''}`} />
                            </div>
                        </div>
                        <label
                            htmlFor="remember-me"
                            className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
                            onClick={() => setRemember(!remember)}
                        >
                            记住我
                        </label>
                    </div>
                    <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                        忘记密码？
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-gold to-primary-purple hover:from-primary-gold/90 hover:to-primary-purple/90 text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-primary-gold/20 hover:shadow-primary-gold/40"
                >
                    {isSubmitting ? '登录中...' : '立即登录'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-white/60">
                还没有账号？{' '}
                <a href="/therapist/register" className="font-medium text-primary-gold hover:text-primary-purple transition-colors">
                    立即注册
                </a>
            </p>
        </div>
    );
};

// Export as default components
const LoginPage = {
    LoginForm,
    VideoBackground
};

export default LoginPage;

