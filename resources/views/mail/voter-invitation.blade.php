<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voter Invitation - {{ $voter->election->title }}</title>
    <style>
        /* Reset styles */
        body, html {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
        }

        /* Main container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            padding: 32px 24px;
            text-align: center;
        }

        .logo {
            width: 60px;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }

        .logo svg {
            width: 32px;
            height: 32px;
            color: white;
        }

        .header-title {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 8px 0;
        }

        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 15px;
            margin: 0;
        }

        /* Content */
        .email-content {
            padding: 40px 32px;
        }

        /* Greeting */
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }

        .intro-text {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
        }

        /* Election info card */
        .election-card {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid #dc2626;
        }

        .election-title {
            font-size: 22px;
            font-weight: bold;
            color: #dc2626;
            margin: 0 0 10px 0;
        }

        .election-description {
            color: #4b5563;
            font-size: 15px;
            margin-bottom: 0;
            line-height: 1.6;
        }

        /* Date information */
        .date-section {
            display: flex;
            gap: 16px;
            margin-bottom: 28px;
            flex-wrap: wrap;
        }

        .date-card {
            flex: 1;
            background-color: #f9fafb;
            border-radius: 10px;
            padding: 16px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }

        .date-label {
            font-size: 13px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .date-value {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
        }

        /* Voter Key Card */
        .key-card {
            background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
            border-radius: 12px;
            padding: 28px 24px;
            margin: 28px 0;
            text-align: center;
            border: 2px solid #dc2626;
            position: relative;
        }

        .key-label {
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
            font-weight: 600;
        }

        .key-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 16px;
        }

        .voter-key {
            font-family: 'Courier New', 'SF Mono', monospace;
            font-size: 32px;
            font-weight: bold;
            color: #dc2626;
            background-color: #ffffff;
            padding: 12px 24px;
            border-radius: 10px;
            letter-spacing: 2px;
            border: 2px solid #e5e7eb;
            display: inline-block;
        }

        .copy-button {
            background-color: #dc2626;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .copy-button:hover {
            background-color: #b91c1c;
        }

        .copy-success {
            background-color: #10b981;
            color: white;
        }

        .key-note {
            font-size: 13px;
            color: #6b7280;
            margin-top: 16px;
        }

        /* Button */
        .vote-button {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            text-decoration: none;
            padding: 16px 36px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 18px;
            margin: 24px 0;
            transition: background-color 0.3s, transform 0.2s;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .vote-button:hover {
            background-color: #b91c1c;
            transform: translateY(-2px);
        }

        /* Info boxes - New Styling */
        .info-grid {
            display: flex;
            gap: 20px;
            margin: 28px 0;
            flex-wrap: wrap;
        }

        .info-box {
            flex: 1;
            border-radius: 16px;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .info-box-header {
            padding: 16px 20px;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .info-important .info-box-header {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
            border-bottom: 2px solid #f59e0b;
        }

        .info-tips .info-box-header {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border-bottom: 2px solid #3b82f6;
        }

        .info-box-content {
            padding: 20px;
            background-color: #ffffff;
        }

        .info-list {
            margin: 0;
            padding-left: 0;
            list-style: none;
        }

        .info-list li {
            font-size: 14px;
            color: #4b5563;
            line-height: 1.7;
            margin-bottom: 12px;
            padding-left: 24px;
            position: relative;
        }

        .info-list li:last-child {
            margin-bottom: 0;
        }

        .info-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: inherit;
            font-weight: bold;
        }

        .info-important .info-list li:before {
            color: #f59e0b;
        }

        .info-tips .info-list li:before {
            color: #3b82f6;
        }

        /* Alternative single column layout for better readability */
        .info-section {
            margin: 28px 0;
        }

        .info-card {
            border-radius: 16px;
            margin-bottom: 20px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .info-card:last-child {
            margin-bottom: 0;
        }

        .info-card-header {
            padding: 16px 20px;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .info-card-important .info-card-header {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
        }

        .info-card-tips .info-card-header {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
        }

        .info-card-content {
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 16px 16px;
        }

        .info-card-list {
            margin: 0;
            padding-left: 0;
            list-style: none;
        }

        .info-card-list li {
            font-size: 14px;
            color: #4b5563;
            line-height: 1.7;
            margin-bottom: 12px;
            padding-left: 28px;
            position: relative;
        }

        .info-card-list li:last-child {
            margin-bottom: 0;
        }

        .info-card-list li:before {
            position: absolute;
            left: 0;
            font-weight: bold;
            font-size: 14px;
        }

        .info-card-important .info-card-list li:before {
            content: "⚠️";
        }

        .info-card-tips .info-card-list li:before {
            content: "💡";
        }

        /* Footer */
        .email-footer {
            background-color: #f9fafb;
            padding: 28px 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin: 0 0 10px 0;
            line-height: 1.5;
        }

        .footer-links {
            margin-top: 16px;
        }

        .footer-links a {
            color: #dc2626;
            text-decoration: none;
            font-size: 13px;
            margin: 0 12px;
        }

        .footer-links a:hover {
            text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 480px) {
            .email-content {
                padding: 28px 20px;
            }

            .date-section {
                flex-direction: column;
            }

            .voter-key {
                font-size: 22px;
                padding: 10px 16px;
            }

            .vote-button {
                font-size: 16px;
                padding: 14px 28px;
            }

            .greeting {
                font-size: 18px;
            }

            .intro-text {
                font-size: 15px;
            }

            .info-grid {
                flex-direction: column;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
    <div align="center">
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <div class="logo">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 class="header-title">VoiceSphere</h1>
                <p class="header-subtitle">Secure Digital Voting Platform</p>
            </div>

            <!-- Content -->
            <div class="email-content">
                <!-- Greeting -->
                <p class="greeting">Hello {{ $voter->name ?? $voter->email }},</p>
                <p class="intro-text">
                    You have been invited to participate in an important election. Please find your voting credentials and election details below.
                </p>

                <!-- Election Details Card -->
                <div class="election-card">
                    <h2 class="election-title">{{ $voter->election->title }}</h2>
                    @if($voter->election->description)
                        <p class="election-description">{{ $voter->election->description }}</p>
                    @endif
                </div>

                <!-- Date Information -->
                <div class="date-section">
                    <div class="date-card">
                        <div class="date-label">Start Date</div>
                        <div class="date-value">{{ \Carbon\Carbon::parse($voter->election->start_date)->format('F j, Y g:i A') }}</div>
                    </div>
                    <div class="date-card">
                        <div class="date-label">End Date</div>
                        <div class="date-value">{{ \Carbon\Carbon::parse($voter->election->end_date)->format('F j, Y g:i A') }}</div>
                    </div>
                    <div class="date-card">
                        <div class="date-label">Timezone</div>
                        <div class="date-value">{{ $voter->election->timezone ?? 'UTC' }}</div>
                    </div>
                </div>

                <!-- Voter Key Card with Copy Button -->
                <div class="key-card">
                    <div class="key-label">Your Voter Key</div>
                    <div class="key-container">
                        <div class="voter-key" id="voterKey">{{ $voter->voter_token }}</div>
                        <button class="copy-button" onclick="copyVoterKey()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy Key
                        </button>
                    </div>
                    <p class="key-note"> Keep this key confidential. You will need it to access your ballot.</p>
                </div>

                <!-- Vote Button (opens in new window) -->
                <div style="text-align: center;">
                    <a href="{{ url('/vote/' . $voter->election->identifier) }}" class="vote-button" target="_blank" rel="noopener noreferrer">
                        Vote Now →
                    </a>
                </div>

                <!-- Important Information & Quick Tips - Side by Side -->
                <div class="info-grid">
                    <!-- Important Information -->
                    <div class="info-box info-important">
                        <div class="info-box-header">
                            {{-- <span>⚠️</span> --}}
                            <span>Important Information</span>
                        </div>
                        <div class="info-box-content">
                            <ul class="info-list">
                                <li>You can only vote once using this voter key</li>
                                <li>Your vote is anonymous and secure</li>
                                <li>The voting link will expire after the election end date</li>
                                <li>If you have any issues, contact the election administrator</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Quick Tips -->
                    <div class="info-box info-tips">
                        <div class="info-box-header">
                            {{-- <span>💡</span> --}}
                            <span>Quick Tips</span>
                        </div>
                        <div class="info-box-content">
                            <ul class="info-list">
                                <li>Ensure stable internet connection before voting</li>
                                <li>Take your time to review all options before submitting</li>
                                <li>Once submitted, votes cannot be changed</li>
                                <li>You'll receive confirmation after casting your vote</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="email-footer">
                <p class="footer-text">
                    This is an automated message from VoiceSphere. Please do not reply to this email.
                </p>
                <p class="footer-text">
                    If you did not expect this invitation, please ignore this email.
                </p>
                <div class="footer-links">
                    <a href="{{ config('app.url') }}/privacy" target="_blank">Privacy Policy</a>
                    <a href="{{ config('app.url') }}/terms" target="_blank">Terms of Service</a>
                    <a href="{{ config('app.url') }}/contact" target="_blank">Contact Support</a>
                </div>
                <p class="footer-text" style="margin-top: 20px;">
                    &copy; {{ date('Y') }} VoiceSphere. All rights reserved.
                </p>
            </div>
        </div>
    </div>

    <script>
        function copyVoterKey() {
            const keyElement = document.getElementById('voterKey');
            const keyText = keyElement.innerText;

            navigator.clipboard.writeText(keyText).then(function() {
                const button = document.querySelector('.copy-button');
                const originalText = button.innerHTML;
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg> Copied!';
                button.classList.add('copy-success');

                setTimeout(function() {
                    button.innerHTML = originalText;
                    button.classList.remove('copy-success');
                }, 2000);
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
                alert('Please manually copy the key: ' + keyText);
            });
        }
    </script>
</body>
</html>