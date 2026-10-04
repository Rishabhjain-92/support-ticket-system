import { TicketPriority, TicketStatus } from '@prisma/client';
import { prisma, pool } from '../src/db/prisma.js';

const seedTicketsData = [
  {
    title: 'Unable to reset password via email link',
    description: 'Customer reports that the password reset link redirects to a 404 page instead of the password update form.',
    customerEmail: 'alex.rivera@example.com',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 1,
  },
  {
    title: 'Billing invoice contains incorrect VAT number',
    description: 'Company VAT ID is missing the country code prefix on the generated September PDF invoice.',
    customerEmail: 'sarah.miller@techcorp.io',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 3,
  },
  {
    title: 'Feature request: Dark mode support on mobile app',
    description: 'Requesting an OLED true dark mode for night usage to reduce eye strain and save battery.',
    customerEmail: 'david.chen@gmail.com',
    priority: TicketPriority.LOW,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 6,
  },
  {
    title: 'Checkout fails with 500 error on Stripe payment',
    description: 'During checkout with 3D Secure enabled cards, the transaction times out and returns an internal server error.',
    customerEmail: 'emma.watson@startup.co',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 8,
  },
  {
    title: 'Profile avatar upload fails for PNG images over 2MB',
    description: 'When uploading a 2.4MB PNG file, no progress indicator appears and the submit button freezes.',
    customerEmail: 'michael.scott@dundermifflin.com',
    priority: TicketPriority.LOW,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 12,
  },
  {
    title: 'API webhook delivery failing for order.created events',
    description: 'Webhooks to our staging endpoint are returning 504 gateway timeout. Headers seem malformed.',
    customerEmail: 'devops@cloudscale.net',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 16,
  },
  {
    title: 'Two-factor authentication SMS not arriving',
    description: 'Customer in the UK (+44) is not receiving OTP SMS codes for login verification.',
    customerEmail: 'charlotte.brown@acme.org',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 20,
  },
  {
    title: 'Export to CSV truncates UTF-8 foreign characters',
    description: 'Customer names with German umlauts (ä, ö, ü) appear garbled when opening the exported file in Excel.',
    customerEmail: 'juergen.klopp@football.de',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 24,
  },
  {
    title: 'Notification preferences do not save in user settings',
    description: 'Unchecking weekly newsletter toggle displays success toast but the preference reverts upon page refresh.',
    customerEmail: 'lisa.ann@designworks.com',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 28,
  },
  {
    title: 'SSO login loop with Google Workspace provider',
    description: 'After selecting Google account, user is redirected back to the login page without any error message.',
    customerEmail: 'admin@fintechgroup.io',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 32,
  },
  {
    title: 'Slow page load on Analytics dashboard table',
    description: 'Loading the 90-day retention chart takes upwards of 8 seconds when more than 10,000 events are present.',
    customerEmail: 'rachel.green@fashionhub.com',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 36,
  },
  {
    title: 'Typo in onboarding tooltip on step 3',
    description: 'The word "configuration" is misspelled as "confguration" in the setup wizard.',
    customerEmail: 'brian.griffin@writersblock.com',
    priority: TicketPriority.LOW,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 40,
  },
  {
    title: 'Webhook retry policy documentation is ambiguous',
    description: 'Docs do not specify whether the exponential backoff algorithm includes jitter or max retry cap.',
    customerEmail: 'kevin.flynn@encom.com',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 44,
  },
  {
    title: 'Subscription cancellation flow requires confirmation modal',
    description: 'Clicking Cancel Subscription immediately downgrades the account without asking for confirmation.',
    customerEmail: 'laura.croft@adventures.org',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 48,
  },
  {
    title: 'Database connection pool exhausted during peak traffic',
    description: 'Backend logs show "TimeoutError: ResourceRequest timed out" between 14:00 and 15:00 UTC.',
    customerEmail: 'system.ops@highload.biz',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 52,
  },
  {
    title: 'Search results pagination resets filter criteria',
    description: 'When filtering by status and clicking page 2, the status filter dropdown clears back to all.',
    customerEmail: 'oliver.queen@starling.city',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 56,
  },
  {
    title: 'PDF receipts missing company tax registration number',
    description: 'Need our registered GSTIN / tax registration number printed on all transaction receipts.',
    customerEmail: 'accounts@delhi-retail.in',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 60,
  },
  {
    title: 'Session expiration does not redirect to login page',
    description: 'When JWT token expires, background AJAX requests fail silently with 401 instead of redirecting.',
    customerEmail: 'vikram.singh@enterprise.co',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 64,
  },
  {
    title: 'Mobile viewport horizontal scroll on iPhone 13 mini',
    description: 'Summary cards table overflows the 375px screen width causing unwanted horizontal scroll.',
    customerEmail: 'clara.oswald@timetravel.uk',
    priority: TicketPriority.LOW,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 68,
  },
  {
    title: 'Bulk delete action fails when selecting more than 50 items',
    description: 'Payload too large (413) is thrown when bulk operations exceed 50 entity IDs.',
    customerEmail: 'harvey.specter@pearsonhardman.com',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 72,
  },
  {
    title: 'Rate limit error triggered under normal browsing',
    description: 'Encountered 429 Too Many Requests after rapidly clicking through 10 ticket previews.',
    customerEmail: 'donna.paulsen@pearsonhardman.com',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 76,
  },
  {
    title: 'Broken link in footer documentation section',
    description: 'The link to "API Reference v2" directs to an old staging URL that is now offline.',
    customerEmail: 'louis.litt@pearsonhardman.com',
    priority: TicketPriority.LOW,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 80,
  },
  {
    title: 'Email notifications delivered with 15-minute delay',
    description: 'Transactional notification emails for ticket assignments are delayed in the BullMQ queue.',
    customerEmail: 'jessica.pearson@pearsonhardman.com',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 84,
  },
  {
    title: 'Incorrect sorting order when clicking table header',
    description: 'Sorting by ticket priority sorts alphabetically (High, Low, Medium) rather than by severity order.',
    customerEmail: 'mike.ross@pearsonhardman.com',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 88,
  },
  {
    title: 'Integration with Slack webhook sends duplicate messages',
    description: 'Every ticket created event sends 2 identical notifications into the #support-alerts Slack channel.',
    customerEmail: 'slack-bot@megacorp.io',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 92,
  },
  {
    title: 'Zero results screen missing clear filters action button',
    description: 'When search filter returns 0 tickets, there is no quick "Reset all filters" button for the user.',
    customerEmail: 'ux.auditor@productreview.com',
    priority: TicketPriority.LOW,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 96,
  },
  {
    title: 'Customer portal shows wrong timezone for ticket replies',
    description: 'Timestamps are displayed in UTC instead of detecting the user browser local timezone.',
    customerEmail: 'ken.adams@friends.tv',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 100,
  },
  {
    title: 'Memory leak in real-time ticket subscription handler',
    description: 'Node.js process RSS memory increases by 50MB per hour when SSE connections remain open.',
    customerEmail: 'site.reliability@cloudops.net',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
    createdAtOffsetHours: 104,
  },
  {
    title: 'Add audit log for ticket status changes',
    description: 'Need to track which agent moved a ticket from In Progress to Resolved and at what exact time.',
    customerEmail: 'security.lead@compliance.org',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    createdAtOffsetHours: 108,
  },
  {
    title: 'Accessibility: Missing aria-labels on action icon buttons',
    description: 'Screen reader users cannot identify the edit and delete icon buttons on the ticket row.',
    customerEmail: 'a11y.advocate@inclusiveweb.org',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
    createdAtOffsetHours: 112,
  },
];

async function main() {
  console.log('🌱 Starting database seed (Pure JavaScript)...');

  // Clean existing tickets
  const deleted = await prisma.ticket.deleteMany();
  console.log(`🧹 Cleared ${deleted.count} existing tickets.`);

  const now = new Date();

  for (const item of seedTicketsData) {
    const createdAt = new Date(now.getTime() - item.createdAtOffsetHours * 60 * 60 * 1000);
    await prisma.ticket.create({
      data: {
        title: item.title,
        description: item.description,
        customerEmail: item.customerEmail,
        priority: item.priority,
        status: item.status,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }

  const totalCount = await prisma.ticket.count();
  const openCount = await prisma.ticket.count({ where: { status: TicketStatus.OPEN } });
  const inProgressCount = await prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } });
  const resolvedCount = await prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } });

  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Summary: Total: ${totalCount} | Open: ${openCount} | In Progress: ${inProgressCount} | Resolved: ${resolvedCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  });
