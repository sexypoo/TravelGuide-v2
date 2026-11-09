import type { Messages } from '../types';

export const legal: Messages['legal'] = {
  shell: {
    navLabel: 'Policy documents',
    privacy: 'Privacy',
    accountDeletion: 'Delete account',
    login: 'Log in',
    translationNotice:
      'This English version is provided for convenience. If it differs from the Korean version, the Korean version applies.',
  },
  privacy: {
    metaTitle: 'Privacy Policy',
    metaDescription:
      'How YeoJJU collects, uses, keeps, and deletes personal information',
    eyebrow: 'Effective August 20, 2026',
    title: 'Privacy Policy',
    description:
      'YeoJJU processes only the information needed to run travel help rooms, and keeps location and verification evidence separate from public profiles.',
    infoTitle: '1. Information we process',
    info: [
      {
        term: 'Account and profile',
        detail:
          'Email, encrypted password, nickname, bio, travel style, profile photo, and social login provider identifier',
      },
      {
        term: 'Verification and location',
        detail:
          'Travel itinerary or local resident evidence files; GPS coordinates, accuracy, and capture time used to confirm the city area; review status and reason',
      },
      {
        term: 'Service activity',
        detail:
          'Questions, answers, chats, community posts and comments, reports, saved places, travel records, and attached images',
      },
      {
        term: 'Pre-registration',
        detail: 'Pre-registration name, email, and time of consent',
      },
    ],
    purposeTitle: '2. Purposes of use and visibility',
    purposeBody:
      'We use this information to authenticate accounts, show profiles, decide access to each city’s help rooms, run real-time questions and answers and the community, handle reports, provide saving features, and keep the service secure. Your nickname and the content you post may be visible to other users. Your email, password, exact GPS coordinates, and original verification evidence are never included in public responses and are accessed only through authorized review processes.',
    retentionTitle: '3. Retention and deletion',
    retentionBody:
      'Account information and service activity are kept for as long as the account exists. Password reset links are valid for 30 minutes only. When an account deletion is completed, we delete the public content, verification and travel records, reports, pre-registration information under the same email, and private files linked to the account. The service currently has no items set aside for separate statutory retention after account deletion.',
    retentionLink: 'Learn more about what is deleted and how',
    vendorsTitle: '4. External services and processing infrastructure',
    vendorsBody:
      'To provide the service, we use infrastructure for deployment, databases, and private file storage. Only for features that are enabled, the service may communicate with Google, Kakao, and Apple login, Google Places/Maps, and Resend email delivery. Information passed on by a social login provider is stored only as far as needed to link the account, and Apple refresh tokens are stored encrypted and revoked when the account is deleted.',
    choicesTitle: '5. Your choices and contact',
    choicesBody:
      'You can edit your public information and delete your account yourself from your profile. If you cannot install the app, you can use the web deletion page instead. For any other privacy questions, please use the developer contact shown in the app store. If this policy changes, we will update the effective date on this page to let you know.',
  },
  accountDeletion: {
    metaTitle: 'Account deletion',
    metaDescription:
      'How to permanently delete your YeoJJU account and its personal information',
    eyebrow: 'Account management',
    title: 'Delete your YeoJJU account',
    description:
      'Even without the app, you can log in on the web and delete your own account.',
    deletedTitle: 'Your account has been deleted.',
    deletedDescription:
      'We have processed the request to delete the data linked to your account.',
    deletedWarning: 'A deleted account cannot be restored.',
    deletedBody: 'To use the service again, please create a new account.',
    home: 'Back to home',
    howTitle: 'How to delete',
    steps: [
      {
        title: 'Log in on the web or in the app',
        body: 'This first confirms that you own the account to delete.',
      },
      {
        title: 'Profile → Account management',
        body: 'Choose to review account deletion.',
      },
      {
        title: 'Confirm it is you, then delete permanently',
        body: 'Password accounts enter their current password, and every account enters the confirmation phrase.',
      },
    ],
    loginCta: 'Log in to delete your account',
    scopeTitle: 'What is deleted',
    scopeLabel: 'Account deletion scope',
    scopeItems: ['Account', 'Public content', 'Private evidence and uploads'],
    scopeBody:
      'We delete your profile, login connections, travel and verification records, questions, answers, chats, and community posts, saved places, pre-registration information under the same email, and the related private files. We also clean up report records for answers and comments elsewhere that disappear along with the deleted account.',
    timingTitle: 'Timing and things to know',
    timingBody:
      'Once you confirm, deletion starts immediately in the production database, and a completed deletion cannot be undone. For Sign in with Apple accounts, the Apple connection is revoked first. You need to log in to prove ownership, but you do not need to install the mobile app.',
  },
  preorder: {
    metaTitle: 'YeoJJU pre-registration',
    metaDescription:
      'When your trip goes off plan, ask verified travelers and locals for the call you need right now.',
    navLabel: 'Pre-registration page menu',
    navAbout: 'About',
    navHow: 'How it works',
    navPreorder: 'Pre-register',
    login: 'Log in',
    heroKicker: 'First pilot area · Jeju',
    heroTitleLine1: 'Stuck on your trip?',
    heroTitleLine2: 'Ask YeoJJU.',
    heroText:
      'Compare fresh experiences from people traveling there now with everyday tips from verified locals in one place, and quickly get the advice your changed plans need.',
    heroPrimary: 'Pre-register',
    heroSecondary: 'Explore the service',
    problemTitle: 'Because trips rarely go exactly as planned.',
    problemLede:
      'Sometimes you need the judgment of someone who knows the place right now, not old search results.',
    problems: [
      {
        title: 'Sudden changes',
        description:
          'Weather, closures, and transport issues that search alone can’t handle',
      },
      {
        title: 'Outdated information',
        description:
          'No way to tell whether the line is long right now or the place is actually open',
      },
      {
        title: 'Recommendations that feel like ads',
        description:
          'Promotional lists and reviews where you can’t tell who recommends what, or why',
      },
    ],
    howTitle: 'From the moment your trip changes until you get an answer.',
    howLede: 'Verification and on-the-spot answers come together in one flow.',
    moments: [
      {
        title: 'Join after confirming your trip',
        description:
          'Travelers and locals are verified, so every help room shows clearly who is answering.',
      },
      {
        title: 'Ask without waiting on one person',
        description:
          'Describe your situation in the destination’s help room, and several verified members answer from their own experience on the ground.',
      },
      {
        title: 'Compare the answers and decide',
        description:
          'See several people’s answers side by side and quickly pick what fits your trip right now.',
      },
    ],
    trustTitle: 'Experience over ads, evidence over recommendations.',
    trustLede:
      'Ask verified travelers and locals about your situation directly, and see who answered and from what experience. You can report ad-like or promotional answers for review.',
    trustPoints: [
      'Badges for verified members',
      'Answer sources such as fresh experience or local tips',
      'Accepted answers and resolved status',
      'Reporting and moderation of promotional answers',
    ],
    signupTitle: 'The first step in turning travel surprises into answers.',
    signupBody:
      'Our first pilot starts in Jeju, but YeoJJU is headed for every destination. Be the first to hear about the launch and how to take part.',
    formLabel: 'Pre-registration form',
    footerTagline: 'When travel changes, people answer.',
    footerNavLabel: 'Policies',
    footerPrivacy: 'Privacy Policy',
    copyright: '© 2026 YeoJJU',
    form: {
      saveFailed:
        'We couldn’t save your registration. Please try again in a moment.',
      successKicker: 'Registered',
      successTitle: 'You’re on the early list.',
      successBody:
        'We’ll email you as soon as there is news about the first pilot.',
      successLink: 'Learn more about YeoJJU',
      kicker: 'Pre-register',
      title: 'Get launch news first',
      body: 'We’ll only email you what you need to know.',
      name: 'Name',
      namePlaceholder: 'Enter your name',
      email: 'Email',
      consentRequired: 'Required',
      consentText:
        'I agree to the collection of my name and email for pre-registration and launch updates.',
      saving: 'Saving',
      submit: 'Pre-register now',
      savingStatus: 'Saving your pre-registration.',
    },
    validation: {
      nameMissing: 'Please enter your name.',
      nameTooLong: 'Please keep your name to 30 characters or fewer.',
      email: 'Please enter a valid email address.',
      privacyConsent: 'Please agree to the collection of personal information.',
    },
  },
};
