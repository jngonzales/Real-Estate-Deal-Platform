-- ============================================
-- SEED DATA FOR REAL ESTATE DEAL PLATFORM
-- Run this in your Supabase SQL Editor after
-- creating a test user account
-- ============================================

-- IMPORTANT: First, sign up for an account in your app at /login
-- Then run this query to get your user ID:
-- SELECT id, email FROM auth.users;

-- Replace 'YOUR_USER_ID_HERE' below with your actual user ID
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

DO $$
DECLARE
    user_id UUID;
    prop1_id UUID;
    prop2_id UUID;
    prop3_id UUID;
    prop4_id UUID;
    prop5_id UUID;
    deal1_id UUID;
    deal2_id UUID;
    deal3_id UUID;
    deal4_id UUID;
    deal5_id UUID;
BEGIN
    -- Get the first user (or specify a specific user ID)
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No users found. Please create an account first.';
    END IF;

    RAISE NOTICE 'Seeding data for user: %', user_id;

    -- ============================================
    -- CREATE PROPERTIES
    -- ============================================

    -- Property 1: Single Family in Austin
    INSERT INTO properties (id, created_by, address, city, state, zip, county, property_type, bedrooms, bathrooms, sqft, year_built)
    VALUES (gen_random_uuid(), user_id, '1234 Oak Street', 'Austin', 'TX', '78701', 'Travis', 'single_family', 3, 2, 1850, 1985)
    RETURNING id INTO prop1_id;

    -- Property 2: Multi-Family in Houston
    INSERT INTO properties (id, created_by, address, city, state, zip, county, property_type, bedrooms, bathrooms, sqft, year_built)
    VALUES (gen_random_uuid(), user_id, '567 Maple Avenue', 'Houston', 'TX', '77001', 'Harris', 'multi_family', 6, 4, 3200, 1978)
    RETURNING id INTO prop2_id;

    -- Property 3: Townhouse in Dallas
    INSERT INTO properties (id, created_by, address, city, state, zip, county, property_type, bedrooms, bathrooms, sqft, year_built)
    VALUES (gen_random_uuid(), user_id, '890 Pine Boulevard', 'Dallas', 'TX', '75201', 'Dallas', 'townhouse', 2, 2, 1400, 2010)
    RETURNING id INTO prop3_id;

    -- Property 4: Single Family in San Antonio
    INSERT INTO properties (id, created_by, address, city, state, zip, county, property_type, bedrooms, bathrooms, sqft, year_built)
    VALUES (gen_random_uuid(), user_id, '2345 Elm Drive', 'San Antonio', 'TX', '78201', 'Bexar', 'single_family', 4, 3, 2400, 1992)
    RETURNING id INTO prop4_id;

    -- Property 5: Condo in Fort Worth
    INSERT INTO properties (id, created_by, address, city, state, zip, county, property_type, bedrooms, bathrooms, sqft, year_built)
    VALUES (gen_random_uuid(), user_id, '678 Cedar Lane Unit 12', 'Fort Worth', 'TX', '76101', 'Tarrant', 'condo', 2, 1, 950, 2015)
    RETURNING id INTO prop5_id;

    -- ============================================
    -- CREATE DEALS
    -- ============================================

    -- Deal 1: Submitted - Hot lead
    INSERT INTO deals (id, property_id, agent_id, status, asking_price, seller_name, seller_phone, seller_email, seller_motivation, notes)
    VALUES (gen_random_uuid(), prop1_id, user_id, 'submitted', 285000, 'John Smith', '512-555-0101', 'john.smith@email.com', 'high', 
            'Motivated seller - relocating for work in 30 days. Property needs cosmetic updates but solid foundation. Great flip opportunity!')
    RETURNING id INTO deal1_id;

    -- Deal 2: Underwriting - Good potential
    INSERT INTO deals (id, property_id, agent_id, status, asking_price, offer_price, seller_name, seller_phone, seller_email, seller_motivation, notes)
    VALUES (gen_random_uuid(), prop2_id, user_id, 'underwriting', 425000, 380000, 'Maria Garcia', '713-555-0202', 'maria.g@email.com', 'medium',
            'Duplex with both units rented. Current rental income $3,200/month. Seller inherited property and wants to liquidate.')
    RETURNING id INTO deal2_id;

    -- Deal 3: Approved - Ready to close
    INSERT INTO deals (id, property_id, agent_id, status, asking_price, offer_price, seller_name, seller_phone, seller_email, seller_motivation, notes)
    VALUES (gen_random_uuid(), prop3_id, user_id, 'approved', 195000, 175000, 'Robert Johnson', '214-555-0303', 'rob.j@email.com', 'high',
            'Divorce situation - both parties want quick sale. Minor repairs needed. HOA is $150/month.')
    RETURNING id INTO deal3_id;

    -- Deal 4: Submitted - Needs work
    INSERT INTO deals (id, property_id, agent_id, status, asking_price, seller_name, seller_phone, seller_email, seller_motivation, notes)
    VALUES (gen_random_uuid(), prop4_id, user_id, 'submitted', 320000, 'Patricia Williams', '210-555-0404', 'pat.w@email.com', 'low',
            'Estate sale - family not in rush. Property has been vacant 6 months. Needs new roof and HVAC. Good bones, needs extensive rehab.')
    RETURNING id INTO deal4_id;

    -- Deal 5: Closed - Success!
    INSERT INTO deals (id, property_id, agent_id, status, asking_price, offer_price, seller_name, seller_phone, seller_email, seller_motivation, notes)
    VALUES (gen_random_uuid(), prop5_id, user_id, 'closed', 165000, 152000, 'David Brown', '817-555-0505', 'david.b@email.com', 'medium',
            'Investor selling to reinvest elsewhere. Tenant in place with lease until March. Turnkey rental property.')
    RETURNING id INTO deal5_id;

    -- ============================================
    -- CREATE UNDERWRITING RECORDS
    -- ============================================

    -- Underwriting for Deal 2 (in underwriting)
    INSERT INTO underwriting_records (deal_id, underwriter_id, arv, repair_estimate, max_offer, recommended_offer, profit_estimate, notes, status)
    VALUES (deal2_id, user_id, 520000, 45000, 385000, 380000, 72000, 
            'Comps support $520K ARV. Units need updating - new kitchens and bathrooms. Factor in 6 month holding period. Strong rental market supports quick lease-up after rehab.',
            'submitted');

    -- Underwriting for Deal 3 (approved)
    INSERT INTO underwriting_records (deal_id, underwriter_id, arv, repair_estimate, max_offer, recommended_offer, profit_estimate, notes, status)
    VALUES (deal3_id, user_id, 245000, 15000, 180000, 175000, 42000,
            'Light cosmetic rehab - paint, flooring, fixtures. ARV based on 3 recent townhouse sales in complex. Low risk deal with solid margins.',
            'approved');

    -- Underwriting for Deal 5 (closed)
    INSERT INTO underwriting_records (deal_id, underwriter_id, arv, repair_estimate, max_offer, recommended_offer, profit_estimate, notes, status)
    VALUES (deal5_id, user_id, 185000, 5000, 155000, 152000, 25000,
            'Turnkey rental - minimal work needed. Bought below market due to seller motivation. Tenant paying $1,100/month. Great cash flow property.',
            'approved');

    RAISE NOTICE 'Seed data created successfully!';
    RAISE NOTICE 'Created 5 properties, 5 deals, and 3 underwriting records';

END $$;

-- ============================================
-- VERIFY SEED DATA
-- ============================================
SELECT 
    'Properties' as table_name, 
    COUNT(*) as count 
FROM properties
UNION ALL
SELECT 
    'Deals' as table_name, 
    COUNT(*) as count 
FROM deals
UNION ALL
SELECT 
    'Underwriting Records' as table_name, 
    COUNT(*) as count 
FROM underwriting_records;
