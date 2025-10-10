<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmailNotification extends VerifyEmail
{
    protected function verificationUrl($notifiable)
    {
        $frontendUrl = config('app.frontend_url');
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(config('auth.verification.expire', 5)),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );

        return $frontendUrl . '/email/verify?' . parse_url($url, PHP_URL_QUERY);
    }

    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Confirm Your Account - Action Required') // ✉️ Custom Subject
            ->greeting('Hello ' . $notifiable->fname . '!') // 👋 Personalized greeting
            ->line('Thank you for registering with us! Please verify your email address to activate your account.') // 🧠 Custom body text
            ->action('Verify My Email', $verificationUrl) // 🔗 Custom button text
            ->line('This verification link will expire in 5mins.') // ⏳ Custom footer text
            ->line('If you did not create this account, please ignore this email.');
    }
}