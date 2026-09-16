const { Client } = require('pg');
const { randomBytes, scryptSync } = require('node:crypto');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

async function seed() {
  const client = new Client({
    connectionString: 'postgresql://postgres:root%40123@localhost:5432/nyaya_db',
  });

  await client.connect();
  console.log('Connected to nyaya_db for seeding...');

  const passHash = hashPassword('Bharath@2006');

  // 1. Users
  const userRows = await client.query(`
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES 
      ('Nyaya Administrator', 'admin@nyaya.in', $1, 'admin'),
      ('Adv. Rohan Iyer', 'rohan.iyer@iyerassociates.in', $1, 'lawyer'),
      ('Rahul Sharma', 'rahul.sharma@email.com', $1, 'client')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id, email, role;
  `, [passHash]);

  console.log('Seeded users:', userRows.rows.map(r => `${r.role}: ${r.email}`));

  const adminUser = userRows.rows.find(r => r.role === 'admin') || (await client.query("SELECT id FROM users WHERE email='admin@nyaya.in'")).rows[0];
  const lawyerUser = userRows.rows.find(r => r.role === 'lawyer') || (await client.query("SELECT id FROM users WHERE email='rohan.iyer@iyerassociates.in'")).rows[0];
  const clientUser = userRows.rows.find(r => r.role === 'client') || (await client.query("SELECT id FROM users WHERE email='rahul.sharma@email.com'")).rows[0];

  // 2. Lawyer Profile
  await client.query(`
    INSERT INTO lawyer_profiles (
      user_id, lawyer_id, bar_council_number, bar_council_state, years_of_experience,
      practice_areas, court_locations, languages, bio, verification_status, account_status, location, phone
    ) VALUES (
      $1, 'LAW-000101', 'MAH/4821/2012', 'Bar Council of Maharashtra & Goa', 12,
      '["Civil Law", "Property Law", "Consumer Law"]',
      '["Bombay High Court", "City Civil Court Mumbai"]',
      '["English", "Hindi", "Marathi"]',
      'Specialist in property dispute resolution, consumer protection, and commercial arbitration before Bombay High Court.',
      'VERIFIED', 'ACTIVE', 'Mumbai, Maharashtra', '+91 98200 44556'
    ) ON CONFLICT (user_id) DO NOTHING;
  `, [lawyerUser.id]);

  // 3. Cases
  const caseRes = await client.query(`
    INSERT INTO cases (case_ref, client_id, lawyer_id, title, category, opposite_party, description, status, progress, next_step)
    VALUES 
      ('CASE-10024', $1, $2, 'Property boundary dispute with neighbour', 'Property Law', 'Ramesh Kumar', 'Encroachment of 2.5 feet on the north boundary wall of survey number 104.', 'ACTIVE', 48, 'Lawyer review of survey map due next week')
    ON CONFLICT (case_ref) DO NOTHING
    RETURNING id;
  `, [clientUser.id, lawyerUser.id]);

  const caseId = caseRes.rows.length > 0 ? caseRes.rows[0].id : 1;

  // 4. Case Requests
  await client.query(`
    INSERT INTO case_requests (request_ref, case_id, client_id, lawyer_id, status, client_message)
    VALUES 
      ('REQ-2026-001', $1, $2, $3, 'ACCEPTED', 'Urgent consultation needed regarding residential boundary demarcations.')
    ON CONFLICT (request_ref) DO NOTHING;
  `, [caseId, clientUser.id, lawyerUser.id]);

  // 5. Appointments
  await client.query(`
    INSERT INTO appointments (appt_ref, case_id, client_id, lawyer_id, type, date, time, status, fee, meeting_link)
    VALUES 
      ('APPT-2026-001', $1, $2, $3, 'VIDEO', '2026-09-21', '11:30 AM', 'CONFIRMED', 1800, 'https://meet.google.com/nya-law-meet')
    ON CONFLICT (appt_ref) DO NOTHING;
  `, [caseId, clientUser.id, lawyerUser.id]);

  // 6. Payments
  await client.query(`
    INSERT INTO payments (payment_ref, case_id, client_id, lawyer_id, type, amount, status)
    VALUES 
      ('PAY-2026-001', $1, $2, $3, 'CONSULTATION', 1800, 'PAID')
    ON CONFLICT (payment_ref) DO NOTHING;
  `, [caseId, clientUser.id, lawyerUser.id]);

  // 7. Notifications
  await client.query(`
    INSERT INTO notifications (user_id, sender_user_id, sender_role, title, message, source, related_case_id, related_case_title, is_read)
    VALUES 
      ($1, $2, 'CLIENT', 'New Case Request', 'Rahul Sharma requested consultation for Property boundary dispute', 'CLIENT', $3, 'Property boundary dispute', false),
      ($2, $1, 'LAWYER', 'Case Accepted', 'Adv. Rohan Iyer has accepted your case request', 'LAWYER', $3, 'Property boundary dispute', false)
  `, [lawyerUser.id, clientUser.id, caseId]);

  console.log('Database seeded successfully with initial data!');
  await client.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
