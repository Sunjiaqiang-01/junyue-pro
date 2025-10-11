'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Smartphone, Lock, User } from 'lucide-react';

interface RegisterFormProps {
    onSubmit: (phone: string, code: string, password: string, name: string) => void;
    onSendCode: (phone: string) => void;
    isSubmitting?: boolean;
    isSendingCode?: boolean;
    countdown?: number;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
    onSubmit, 
    onSendCode,
    isSubmitting = false,
    isSendingCode = false,
    countdown = 0
}) => {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(phone, code, password, name);
    };

    const handleSendCode = () => {
        if (phone && !isSendingCode && countdown === 0) {
            onSendCode(phone);
        }
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
                        <span className="relative inline-block">创建您的专属账号</span>
                    </span>
                    <span className="text-xs text-white/50">
                        享受专业上门SPA服务
                    </span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <User className="text-white/60" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="姓名"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={20}
                        className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary-gold/50 transition-colors"
                    />
                </div>

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
                        maxLength={11}
                        className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary-gold/50 transition-colors"
                    />
                </div>

                <div className="relative flex space-x-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="验证码"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            maxLength={6}
                            className="w-full pl-3 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary-gold/50 transition-colors"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={isSendingCode || countdown > 0 || !phone}
                        className="px-4 py-2 bg-primary-gold/20 border border-primary-gold/30 rounded-lg text-white/90 hover:bg-primary-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
                    >
                        {countdown > 0 ? `${countdown}秒` : isSendingCode ? '发送中...' : '发送验证码'}
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Lock className="text-white/60" size={18} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="密码（6-20位）"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        maxLength={20}
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

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-gold to-primary-purple hover:from-primary-gold/90 hover:to-primary-purple/90 text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-primary-gold/20 hover:shadow-primary-gold/40"
                >
                    {isSubmitting ? '注册中...' : '立即注册'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
                已有账号？{' '}
                <a href="/therapist/login" className="font-medium text-primary-gold hover:text-primary-purple transition-colors">
                    立即登录
                </a>
            </p>
        </div>
    );
};

export default RegisterForm;

