import mongoose from 'mongoose';
import { User } from './models/User.ts';
import { Hobby } from './models/Hobby.ts';
import { Connection } from './models/Connection.ts';
import { Message } from './models/Message.ts';
import { Post } from './models/Post.ts';

export async function seedDatabaseIfEmpty() {
  // Check if old dating-style users exist
  const oldStyleUser = await User.findOne({ username: 'alex_brew' });
  if (oldStyleUser) {
    console.log('Migrating database from personal profiles to anonymized hobbyist craft handles...');
    await Promise.all([
      User.deleteMany({}),
      Hobby.deleteMany({}),
      Connection.deleteMany({}),
      Message.deleteMany({}),
      Post.deleteMany({}),
    ]);
  } else {
    const existingCount = await Hobby.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already seeded with ${existingCount} craft communities.`);
      return;
    }
  }

  console.log('Seeding initial craft & hobby dataset for HobbyConnect...');

  // 1. High Quality Craft Hobbies
  const hobbyData = [
    {
      name: 'Specialty Coffee & Brewing',
      category: 'Culinary & Food',
      description: 'Dialing in espresso extraction, single-origin roast profiles, pour-over water chemistry, and latte art micro-foam techniques.',
      icon: 'Coffee',
      tags: ['Espresso', 'V60 PourOver', 'Latte Art', 'Single Origin', 'Roast Profiles'],
      bannerImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      difficulty: 'All Levels',
    },
    {
      name: 'Bouldering & Rock Climbing',
      category: 'Sports & Outdoors',
      description: 'Indoor problem solving (V3-V8), outdoor crags, climbing partner safety checks, beta exchanges, and fingerboard training.',
      icon: 'Mountain',
      tags: ['Bouldering', 'Crag Beta', 'Lead Climbing', 'Fingerboard', 'V-Grade'],
      bannerImage: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&auto=format&fit=crop&q=80',
      difficulty: 'All Levels',
    },
    {
      name: 'Indie Game Development',
      category: 'Tech & Gaming',
      description: 'Building games with Godot, Unity, pixel art sprites, shader programming, game jam collaboration, and playtesting feedback.',
      icon: 'Gamepad2',
      tags: ['Godot 4', 'Pixel Art', 'Game Jam', 'GLSL Shaders', 'Game Design'],
      bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Intermediate',
    },
    {
      name: 'Modular Synthesizers & Sound Design',
      category: 'Music & Audio',
      description: 'Eurorack modules, patching CV/Gate, generative ambient soundscapes, analog synthesis, and hardware audio engineering.',
      icon: 'Radio',
      tags: ['Eurorack', 'Sound Design', 'Generative Audio', 'Analog Synth', 'CV Patching'],
      bannerImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Advanced',
    },
    {
      name: 'Analog & Film Photography',
      category: 'Creative & Arts',
      description: '35mm & 120 medium format cameras, black & white darkroom chemistry, film stocks comparison, and manual lens optics.',
      icon: 'Camera',
      tags: ['35mm Film', 'Darkroom Dev', 'Medium Format', 'Optics', 'Street Craft'],
      bannerImage: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Beginner Friendly',
    },
    {
      name: 'Pottery & Ceramic Wheel Throwing',
      category: 'Creative & Arts',
      description: 'Wheel throwing symmetry, centering stoneware, hand-building, glaze chemistry, and high-fire reduction kiln firings.',
      icon: 'Palette',
      tags: ['Wheel Throwing', 'Stoneware', 'Glaze Chemistry', 'Reduction Kiln', 'Ceramics'],
      bannerImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
      difficulty: 'All Levels',
    },
    {
      name: 'Urban Gardening & Microgreens',
      category: 'Lifestyle & Wellness',
      description: 'Balcony hydroponics, organic soil microbiology, heirloom propagation, compost tea brewing, and year-round indoor grow setups.',
      icon: 'Sprout',
      tags: ['Hydroponics', 'Balcony Garden', 'Microbiology', 'Heirloom Seeds', 'Grow Lights'],
      bannerImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Beginner Friendly',
    },
    {
      name: 'Chess Strategy & Analysis',
      category: 'Learning & Science',
      description: 'Opening repertoires, tactical calculation, classical endgame analysis, master game reviews, and rapid sparring sessions.',
      icon: 'Crown',
      tags: ['Tactics Calculation', 'Classical Analysis', 'Opening Theory', 'Endgames', 'Sparring'],
      bannerImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=80',
      difficulty: 'All Levels',
    },
  ];

  const createdHobbies = await Hobby.insertMany(hobbyData);
  const hobbyMap = new Map(createdHobbies.map((h) => [h.name, h]));

  // 2. Anonymized Craft Collaborators (NO personal dating-style selfies, pure craft/maker photos!)
  const userData = [
    {
      name: 'BrewLab_#481',
      username: 'brewlab_481',
      email: 'brewlab@hobbyconnect.dev',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
      bio: 'Testing washed Gesha roast profiles & V60 pour intervals. Also training fingerboard grips & projecting V6 bouldering routes. Looking for bean swaps & climbing gym practice buddies.',
      location: 'Pacific Northwest',
      availability: 'Weekday Evenings & Saturday mornings',
      hobbies: [
        {
          hobbyId: hobbyMap.get('Specialty Coffee & Brewing')!._id,
          hobbyName: 'Specialty Coffee & Brewing',
          skillLevel: 'Advanced',
          yearsExperience: 4,
        },
        {
          hobbyId: hobbyMap.get('Bouldering & Rock Climbing')!._id,
          hobbyName: 'Bouldering & Rock Climbing',
          skillLevel: 'Intermediate',
          yearsExperience: 2,
        },
        {
          hobbyId: hobbyMap.get('Analog & Film Photography')!._id,
          hobbyName: 'Analog & Film Photography',
          skillLevel: 'Beginner',
          yearsExperience: 1,
        },
      ],
    },
    {
      name: 'PatchBay_#812',
      username: 'patchbay_812',
      email: 'patchbay@hobbyconnect.dev',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&auto=format&fit=crop&q=80',
      bio: 'Eurorack sound designer & Godot 4 game programmer. Building procedural ambient audio systems. Looking for indie game jam collaborators and synth patch sheet exchanges.',
      location: 'Remote Studio',
      availability: 'Friday nights & Weekend studio sessions',
      hobbies: [
        {
          hobbyId: hobbyMap.get('Modular Synthesizers & Sound Design')!._id,
          hobbyName: 'Modular Synthesizers & Sound Design',
          skillLevel: 'Mentor',
          yearsExperience: 6,
        },
        {
          hobbyId: hobbyMap.get('Indie Game Development')!._id,
          hobbyName: 'Indie Game Development',
          skillLevel: 'Advanced',
          yearsExperience: 3,
        },
        {
          hobbyId: hobbyMap.get('Specialty Coffee & Brewing')!._id,
          hobbyName: 'Specialty Coffee & Brewing',
          skillLevel: 'Intermediate',
          yearsExperience: 2,
        },
      ],
    },
    {
      name: 'CragBeta_#309',
      username: 'cragbeta_309',
      email: 'cragbeta@hobbyconnect.dev',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=300&auto=format&fit=crop&q=80',
      bio: 'Projecting V7-V8 roof problems at the local bouldering gym. Developing 35mm Tri-X film at home. Looking for dedicated climbing spotters and darkroom technique partners.',
      location: 'Bay Area Crags',
      availability: 'Tuesdays, Thursdays, Saturday crag sessions',
      hobbies: [
        {
          hobbyId: hobbyMap.get('Bouldering & Rock Climbing')!._id,
          hobbyName: 'Bouldering & Rock Climbing',
          skillLevel: 'Advanced',
          yearsExperience: 5,
        },
        {
          hobbyId: hobbyMap.get('Analog & Film Photography')!._id,
          hobbyName: 'Analog & Film Photography',
          skillLevel: 'Intermediate',
          yearsExperience: 2,
        },
      ],
    },
    {
      name: 'ClayStudio_#640',
      username: 'claystudio_640',
      email: 'claystudio@hobbyconnect.dev',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
      bio: 'High-fire stoneware pottery & reduction glaze chemistry. Balcony hydroponics setup with rare heirloom herbs. Looking for shared kiln firings & urban gardening seed swaps.',
      location: 'Studio Loft',
      availability: 'Sunday studio hours & Evenings',
      hobbies: [
        {
          hobbyId: hobbyMap.get('Pottery & Ceramic Wheel Throwing')!._id,
          hobbyName: 'Pottery & Ceramic Wheel Throwing',
          skillLevel: 'Mentor',
          yearsExperience: 7,
        },
        {
          hobbyId: hobbyMap.get('Urban Gardening & Microgreens')!._id,
          hobbyName: 'Urban Gardening & Microgreens',
          skillLevel: 'Intermediate',
          yearsExperience: 3,
        },
        {
          hobbyId: hobbyMap.get('Specialty Coffee & Brewing')!._id,
          hobbyName: 'Specialty Coffee & Brewing',
          skillLevel: 'Beginner',
          yearsExperience: 1,
        },
      ],
    },
    {
      name: 'TacticsLab_#715',
      username: 'tacticslab_715',
      email: 'tacticslab@hobbyconnect.dev',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=300&auto=format&fit=crop&q=80',
      bio: 'FIDE 2050 rapid/classical analysis. Building roguelike chess mechanics in Godot. Looking for blitz sparring partners and game jam coders.',
      location: 'Remote Sparring',
      availability: 'Flexible remote sessions',
      hobbies: [
        {
          hobbyId: hobbyMap.get('Chess Strategy & Analysis')!._id,
          hobbyName: 'Chess Strategy & Analysis',
          skillLevel: 'Advanced',
          yearsExperience: 10,
        },
        {
          hobbyId: hobbyMap.get('Indie Game Development')!._id,
          hobbyName: 'Indie Game Development',
          skillLevel: 'Intermediate',
          yearsExperience: 2,
        },
      ],
    },
  ];

  const createdUsers = [];
  for (const u of userData) {
    const userDoc = new User(u);
    await userDoc.save();
    createdUsers.push(userDoc);
  }

  // Update memberCounts
  for (const h of createdHobbies) {
    const count = await User.countDocuments({ 'hobbies.hobbyId': h._id });
    h.memberCount = count;
    await h.save();
  }

  // 3. Seed Craft Connections
  const brewLab = createdUsers[0];
  const patchBay = createdUsers[1];
  const cragBeta = createdUsers[2];
  const clayStudio = createdUsers[3];

  // Connection between BrewLab and PatchBay: Accepted over Specialty Coffee
  await Connection.create({
    requester: brewLab._id,
    recipient: patchBay._id,
    status: 'accepted',
    introMessage: 'Hello! I noticed you are dialing in V60 pour-over technique alongside synthesizer music. Would love to swap grind recipes.',
    hobbyContext: 'Specialty Coffee & Brewing',
  });

  // Connection request from CragBeta to BrewLab: Pending Incoming over Bouldering
  await Connection.create({
    requester: cragBeta._id,
    recipient: brewLab._id,
    status: 'pending',
    introMessage: 'Projecting V5-V7 overhang problems this week. Need a spotter and beta exchange partner.',
    hobbyContext: 'Bouldering & Rock Climbing',
  });

  // Connection between PatchBay and ClayStudio: Accepted over Pottery
  await Connection.create({
    requester: patchBay._id,
    recipient: clayStudio._id,
    status: 'accepted',
    introMessage: 'Working on ambient audio design for craft studio timelapses. Would love to collaborate on a ceramics pottery showcase.',
    hobbyContext: 'Pottery & Ceramic Wheel Throwing',
  });

  // 4. Seed Messages between BrewLab and PatchBay (Craft discussions, NOT dating chat!)
  await Message.create([
    {
      sender: brewLab._id,
      recipient: patchBay._id,
      content: 'Hey! What burr set are you using for your filter brews? I just aligned an SSP cast burr for light roast clarity.',
      hobbyContext: 'Specialty Coffee & Brewing',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
    {
      sender: patchBay._id,
      recipient: brewLab._id,
      content: 'Using 64mm unimodal burrs! Running 92C water with 50ppm hardness. The floral jasmine notes on the washed Gesha really shine.',
      hobbyContext: 'Specialty Coffee & Brewing',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      sender: brewLab._id,
      recipient: patchBay._id,
      content: 'Nice! Also saw your Godot 4 audio integration. Did you use FMOD or the native AudioStreamPlayer bus?',
      hobbyContext: 'Indie Game Development',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      sender: patchBay._id,
      recipient: brewLab._id,
      content: 'Native AudioStreamPlayer with custom DSP low-pass filter scripts. Happy to share the GitHub repo if you want to inspect the codebase!',
      hobbyContext: 'Indie Game Development',
      read: false,
      createdAt: new Date(Date.now() - 1800000),
    },
  ]);

  // Seed Messages for CragBeta to BrewLab (beta exchange)
  await Message.create({
    sender: cragBeta._id,
    recipient: brewLab._id,
    content: 'Projecting V5-V7 roof problems this week. Need a spotter and beta exchange partner at the crag.',
    hobbyContext: 'Bouldering & Rock Climbing',
    read: false,
    createdAt: new Date(Date.now() - 7200000),
  });

  // 5. Seed Authentic Craft Posts
  await Post.create([
    {
      author: brewLab._id,
      hobbyId: hobbyMap.get('Specialty Coffee & Brewing')!._id,
      hobbyName: 'Specialty Coffee & Brewing',
      title: 'Dialed in a 1:16.5 ratio on the V60 with 93°C water — Clean floral extraction notes',
      content: 'Tested pour intervals (45s bloom, then 3 continuous spiral pours at 4.2g/s). The clarity in this washed Gesha opened up completely with 55ppm total hardness water. Has anyone else tested Lotus mineral drops vs Third Wave Water?',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      tags: ['V60', 'PourOverBeta', 'WaterChemistry'],
      likes: [patchBay._id, clayStudio._id],
      comments: [
        {
          author: patchBay._id,
          authorName: 'PatchBay_#812',
          authorAvatar: patchBay.avatar,
          content: 'Low magnesium and high calcium gave me optimal acidity perception on light roast Ethiopian beans!',
          createdAt: new Date(Date.now() - 10000000),
        },
      ],
    },
    {
      author: patchBay._id,
      hobbyId: hobbyMap.get('Modular Synthesizers & Sound Design')!._id,
      hobbyName: 'Modular Synthesizers & Sound Design',
      title: 'Generative FM patch using Maths and Rings into a stereo shimmer reverb',
      content: 'Clock dividers modulating low-pass gates through a pseudo-random shift register. Outputting 24-bit 48kHz audio stems for anyone building game jam soundtracks or background ambience.',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      tags: ['Eurorack', 'SoundDesign', 'PatchSheet'],
      likes: [brewLab._id],
      comments: [],
    },
    {
      author: cragBeta._id,
      hobbyId: hobbyMap.get('Bouldering & Rock Climbing')!._id,
      hobbyName: 'Bouldering & Rock Climbing',
      title: 'Crux sequence unlocked on the V7 roof problem after heel hook micro-adjustments',
      content: 'The key beta was maintaining maximum tension on the left heel while dropping the right knee into a drop-knee before reaching for the sloper. Looking for partners heading to Salt Point outdoor crag this weekend.',
      imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&auto=format&fit=crop&q=80',
      tags: ['BoulderingBeta', 'V7Project', 'RoofTechnique'],
      likes: [brewLab._id],
      comments: [],
    },
  ]);

  console.log('Craft dataset seeded successfully with anonymized maker handles and authentic craft imagery.');
}
