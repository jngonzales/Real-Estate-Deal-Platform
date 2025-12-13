-- Email Queue Table for Automated Sequences
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  template_name VARCHAR(100) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, cancelled
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_deal ON email_queue(deal_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  trigger_on_status VARCHAR(50), -- Deal status that triggers this email
  delay_days INTEGER DEFAULT 0, -- Days to wait after trigger
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (name, description, subject, body, trigger_on_status, delay_days) VALUES
(
  'first_follow_up',
  'Initial follow-up after deal submission',
  'Following up on your property at {address}',
  'Hi {owner_name},

Thank you for submitting your property at {address} to our platform.

We''ve received your information and our team is currently reviewing the details. Here''s what happens next:

1. Our underwriting team will analyze the property (typically 2-3 business days)
2. We''ll prepare an offer based on market conditions and property condition
3. You''ll receive our offer via email and can review it in your dashboard

Current Status: {status}
Submitted On: {submitted_date}

If you have any questions or additional information to share, please reply to this email or contact us at support@dealflow.com.

Best regards,
The DealFlow Team',
  'submitted',
  1
),
(
  'underwriting_complete',
  'Notification when underwriting is complete',
  'Your property analysis is complete - {address}',
  'Hi {owner_name},

Great news! We''ve completed the analysis for your property at {address}.

Our underwriting team has reviewed:
✓ Property condition and comparable sales
✓ Market conditions in your area
✓ Potential repair costs and improvements

We''re now preparing your offer. You can expect to receive it within the next 24-48 hours.

View your deal status: {deal_link}

Thank you for your patience!

Best regards,
The DealFlow Team',
  'underwriting',
  0
),
(
  'offer_sent_notification',
  'Notification when offer is sent to seller',
  'Your offer is ready - {address}',
  'Hi {owner_name},

We''re excited to share our offer for your property at {address}!

Offer Amount: {offer_price}
Estimated Closing: {estimated_closing}

You can review the full offer details, including terms and timeline, by logging into your dashboard:
{deal_link}

This offer is valid for 7 days. If you have any questions or would like to discuss the terms, please don''t hesitate to reach out.

We look forward to working with you!

Best regards,
The DealFlow Team',
  'offer_sent',
  0
),
(
  'offer_reminder',
  'Reminder about pending offer',
  'Reminder: Your offer expires soon - {address}',
  'Hi {owner_name},

Just a friendly reminder that our offer for {address} will expire in 2 days.

Offer Amount: {offer_price}
Expires: {expiration_date}

To accept or discuss the offer, please log in to your dashboard:
{deal_link}

If you need more time or have questions, please let us know. We''re here to help!

Best regards,
The DealFlow Team',
  'offer_sent',
  5
),
(
  'contract_signed',
  'Confirmation when deal is in contract',
  'Congratulations! We''re under contract - {address}',
  'Hi {owner_name},

Fantastic news! We''re now officially under contract for {address}.

Next Steps:
1. Title company will reach out within 24 hours
2. We''ll schedule the property inspection (if applicable)
3. Closing is scheduled for approximately {closing_date}

You can track the progress of your deal anytime:
{deal_link}

Congratulations on this milestone!

Best regards,
The DealFlow Team',
  'in_contract',
  0
),
(
  'closing_reminder',
  'Reminder about upcoming closing',
  'Closing soon - {address}',
  'Hi {owner_name},

Your closing for {address} is coming up soon!

Scheduled Closing Date: {closing_date}
Closing Location: {closing_location}

Please bring:
- Valid photo ID
- Any keys, garage door openers, or access codes
- HOA documents (if applicable)

If you have any last-minute questions, please contact your closing coordinator.

We''re excited to close this deal with you!

Best regards,
The DealFlow Team',
  'funding',
  3
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically schedule emails when deal status changes
CREATE OR REPLACE FUNCTION schedule_automated_emails()
RETURNS TRIGGER AS $$
DECLARE
  template RECORD;
  scheduled_time TIMESTAMPTZ;
BEGIN
  -- Only proceed if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Find all active templates for this status
    FOR template IN 
      SELECT * FROM email_templates 
      WHERE trigger_on_status = NEW.status 
      AND is_active = true
    LOOP
      -- Calculate scheduled time
      scheduled_time := NOW() + (template.delay_days || ' days')::INTERVAL;
      
      -- Insert into email queue
      INSERT INTO email_queue (
        deal_id,
        recipient_email,
        recipient_name,
        template_name,
        subject,
        scheduled_for,
        metadata
      ) VALUES (
        NEW.id,
        NEW.seller_email,
        NEW.seller_name,
        template.name,
        template.subject,
        scheduled_time,
        jsonb_build_object(
          'template_id', template.id,
          'status', NEW.status
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-schedule emails on status change
CREATE TRIGGER auto_schedule_emails_on_status_change
  AFTER UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION schedule_automated_emails();

-- Grant permissions (adjust as needed)
-- ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
