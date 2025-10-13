import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// 生成6位数字验证码
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 存储验证码到数据库
export async function saveVerificationCode(email: string, code: string) {
  // 删除该邮箱的所有未使用的旧验证码
  await prisma.verificationCode.deleteMany({
    where: {
      email,
      usedAt: null,
    },
  });

  // 创建新验证码
  await prisma.verificationCode.create({
    data: {
      email,
      code,
      type: "RESET_PASSWORD",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分钟后过期
    },
  });
}

// 验证验证码
export async function verifyCode(email: string, code: string): Promise<boolean> {
  const verificationCode = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      usedAt: null, // 未使用
      expiresAt: {
        gt: new Date(), // 未过期
      },
    },
  });

  if (!verificationCode) {
    return false; // 验证码不存在、已使用或已过期
  }

  // 标记为已使用
  await prisma.verificationCode.update({
    where: { id: verificationCode.id },
    data: { usedAt: new Date() },
  });

  return true;
}

// 清理过期验证码（建议定时任务调用）
export async function cleanExpiredCodes() {
  await prisma.verificationCode.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

/**
 * 发送欢迎邮件
 * @param toEmail 收件人邮箱
 * @param username 用户名
 * @param registrationCode 用户使用的注册验证码
 */
export async function sendWelcomeEmail(
  toEmail: string,
  username: string,
  registrationCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 检查环境变量
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return {
        success: false,
        error: "邮件服务未配置",
      };
    }

    // 验证SMTP_USER是否已修改
    if (process.env.SMTP_USER === "your-qq-email@qq.com") {
      return {
        success: false,
        error: "邮箱配置错误",
      };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"君悦SPA" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "欢迎加入君悦SPA！",
      html: `
        <div style="padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #D4AF37; margin-bottom: 20px;">🎉 欢迎加入君悦SPA！</h1>
            
            <p style="color: #333; font-size: 16px;">亲爱的 <strong>${username}</strong>，</p>
            
            <p style="color: #666; line-height: 1.6;">
              恭喜您成功注册成为君悦SPA的认证技师！我们很高兴您加入我们的专业团队。
            </p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #D4AF37; margin-top: 0;">您的专属信息</h3>
              <p style="color: #666; margin: 10px 0;">
                <strong>用户名：</strong>${username}
              </p>
                    <p style="color: #666; margin: 10px 0;">
                      <strong>注册邮箱：</strong>${toEmail}
                    </p>
                    <p style="color: #666; margin: 10px 0;">
                      <strong>您使用的注册验证码：</strong><span style="color: #D4AF37; font-size: 18px; font-weight: bold;">${registrationCode}</span>
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 10px;">
                      💡 请妥善保管此验证码，它关联您的注册信息。
                    </p>
            </div>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #333;">下一步操作</h3>
              <ol style="color: #666; line-height: 2;">
                <li>完善个人资料，上传至少3张照片</li>
                <li>填写服务详情和擅长项目</li>
                <li>等待平台审核（48小时内完成）</li>
                <li>审核通过后即可开始接单</li>
              </ol>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0;">
                  <p style="color: #856404; margin: 0; font-size: 14px;">
                    <strong>⚠️ 温馨提示：</strong><br>
                    请妥善保管您的账号密码。如忘记密码，可通过注册邮箱找回。
                  </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/therapist/dashboard" 
                 style="display: inline-block; background: linear-gradient(to right, #D4AF37, #F4C430); color: black; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                前往工作台
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; color: #999; font-size: 12px;">
              <p>如有任何问题，请联系平台客服。</p>
              <p>此邮件由系统自动发送，请勿回复。</p>
              <p>© 2025 君悦SPA. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error("发送欢迎邮件失败:", error);
    return {
      success: false,
      error: error.message || "发送邮件失败",
    };
  }
}

// 邮箱打码函数
export function maskEmail(email: string): string {
  const [username, domain] = email.split("@");

  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }

  const visibleStart = username.slice(0, 2);
  const visibleEnd = username.slice(-1);
  const masked = "*".repeat(Math.min(username.length - 3, 4));

  return `${visibleStart}${masked}${visibleEnd}@${domain}`;
}

// 发送验证码邮件
export async function sendVerificationCode(
  toEmail: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 检查环境变量
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return {
        success: false,
        error: "邮件服务未配置，请联系管理员",
      };
    }

    // 验证SMTP_USER是否已修改
    if (process.env.SMTP_USER === "your-qq-email@qq.com") {
      return {
        success: false,
        error: "邮箱配置错误：请在.env文件中修改SMTP_USER为真实QQ邮箱",
      };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.qq.com
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true, // 使用SSL
      auth: {
        user: process.env.SMTP_USER, // 发送方邮箱
        pass: process.env.SMTP_PASS, // 授权码
      },
    });

    // 验证连接
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.error("SMTP连接验证失败:", verifyError);

      if (verifyError.code === "EAUTH") {
        return {
          success: false,
          error: "邮箱授权码错误，请检查.env中的SMTP_PASS配置",
        };
      }

      if (verifyError.code === "ESOCKET") {
        return {
          success: false,
          error: "无法连接到邮件服务器，请检查网络或SMTP配置",
        };
      }

      return {
        success: false,
        error: `邮件服务连接失败: ${verifyError.message}`,
      };
    }

    await transporter.sendMail({
      from: `"君悦SPA" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "君悦SPA - 密码重置验证码",
      html: `
        <div style="padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #D4AF37; margin-bottom: 20px;">君悦SPA</h1>
            <h2 style="color: #333;">密码重置验证码</h2>
            <p style="color: #666;">您好，</p>
            <p style="color: #666;">您正在重置密码，您的验证码是：</p>
            
            <div style="font-size: 32px; font-weight: bold; color: #D4AF37; padding: 20px; background: #f9f9f9; border-radius: 5px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            
            <p style="color: #999; margin-top: 20px;">
              验证码5分钟内有效，请勿泄露给他人。
            </p>
            <p style="color: #999;">
              如果这不是您的操作，请忽略此邮件。
            </p>
            
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; color: #999; font-size: 12px;">
              <p>此邮件由系统自动发送，请勿回复。</p>
              <p>© 2025 君悦SPA. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error("发送邮件失败:", error);

    // 详细错误处理
    if (error.code === "EMESSAGE") {
      return {
        success: false,
        error: "邮件内容格式错误",
      };
    }

    if (error.responseCode === 550) {
      return {
        success: false,
        error: "收件人邮箱不存在或被拒收",
      };
    }

    if (error.responseCode === 552) {
      return {
        success: false,
        error: "邮箱容量已满",
      };
    }

    return {
      success: false,
      error: error.message || "发送邮件失败，请稍后重试",
    };
  }
}
