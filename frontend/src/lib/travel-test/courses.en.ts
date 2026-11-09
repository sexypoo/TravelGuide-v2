import type { TravelTypeKey } from './content';
import type { CourseRegionKey, CourseStopText } from './courses';

// English text for the sample day courses (#80). Times stay in `courses.ts`;
// stops here follow the Korean stops in the same order. Like the Korean
// notes, no opening hours or prices.

type Stops = readonly [
  CourseStopText,
  CourseStopText,
  CourseStopText,
  CourseStopText,
];

export type CourseRegionText = {
  name: string;
  courses: Record<TravelTypeKey, Stops>;
};

export const COURSE_TEXT_EN: Record<CourseRegionKey, CourseRegionText> = {
  jeju: {
    name: 'Jeju',
    courses: {
      dawn: [
        {
          place: 'Sunrise at Darangshi Oreum',
          note: 'The climb to the top is steep. Bring a windbreaker.',
        },
        {
          place: 'Neighborhood soup spot in Gujwa',
          note: 'Come down from the oreum and warm up with hot soup for breakfast.',
        },
        {
          place: 'Bijarim Forest trail',
          note: 'The shade is deep, so it is lovely to walk before midday.',
        },
        {
          place: 'Jongdal-ri coastal road',
          note: 'After an early start, slow down by the sea.',
        },
      ],
      food: [
        {
          place: 'Dongmun Market',
          note: 'Start the day with snacks and noodles deep inside the market.',
        },
        {
          place: 'A bowl of gogi-guksu (pork noodle soup)',
          note: 'Go just before lunchtime for a shorter wait.',
        },
        {
          place: 'Jeju Five-Day Market',
          note: 'Open only on dates ending in 2 or 7.',
        },
        {
          place: 'Seafood restaurant near the harbor',
          note: 'Ask what came in that day before you order.',
        },
      ],
      slow: [
        {
          place: 'Seaside café in Aewol',
          note: 'Spend the morning at a window seat facing the sea.',
        },
        {
          place: 'Handam Coastal Walk',
          note: 'Stroll slowly beside the sea from Aewol to Gwakji.',
        },
        {
          place: 'Neighborhood bookshop',
          note: 'Pick out a book full of Jeju stories.',
        },
        {
          place: 'Sunset at Hyeopjae Beach',
          note: 'Try to arrive 30 minutes before sunset.',
        },
      ],
      mood: [
        {
          place: 'Sunrise at Gwangchigi Beach',
          note: 'The sun rises behind Seongsan Ilchulbong.',
        },
        {
          place: 'Kim Tschang-Yeul Art Museum',
          note: 'A quiet gallery that works on rainy days too.',
        },
        {
          place: 'Gift shop alley in Hallim',
          note: 'Collect postcards and small souvenirs.',
        },
        {
          place: 'Sunset at Suwolbong Peak',
          note: 'At the western tip of Jeju, the sunset lingers.',
        },
      ],
      night: [
        {
          place: 'Seaside walk in Tapdong',
          note: 'Walk along the breakwater as the sun goes down.',
        },
        {
          place: 'Dongmun Night Market',
          note: 'Work your way through the stalls, shortest line first.',
        },
        {
          place: 'Bar street near Jeju City Hall',
          note: 'Lots of places here stay open late.',
        },
        {
          place: 'The night sea near your stay',
          note: 'On a cloudless night, you can see the stars too.',
        },
      ],
      spont: [
        {
          place: 'Surf lesson at Jungmun Saekdal Beach',
          note: 'Check the waves that morning.',
        },
        {
          place: 'Seaside village restaurant',
          note: 'Walk into whichever local spot catches your eye.',
        },
        {
          place: 'Bus ride along the coast',
          note: 'Hop off at any village you like and walk.',
        },
        {
          place: 'Ask in the help room',
          note: '"Anywhere good to go near me right now?"',
        },
      ],
      plan: [
        {
          place: 'Seongsan Ilchulbong',
          note: 'Go early, before the tour groups arrive.',
        },
        {
          place: 'Ferry to Udo from Seongsan Port',
          note: 'On windy days, check first whether the ferry is running.',
        },
        {
          place: 'Seopjikoji',
          note: 'An easy stop on the way back from Udo.',
        },
        {
          place: 'Black pork dinner, booked ahead',
          note: 'Book before the dinner rush to keep it easy.',
        },
      ],
      market: [
        {
          place: 'Jeju Five-Day Market',
          note: 'Open only on dates ending in 2 or 7.',
        },
        {
          place: 'Gukbap spot inside the market',
          note: 'Break from shopping for lunch, just like the market folks.',
        },
        {
          place: 'Tangerine picking',
          note: 'In season from late fall through winter.',
        },
        {
          place: 'Seogwipo Maeil Olle Market',
          note: 'Grab your last souvenirs and snacks.',
        },
      ],
    },
  },
  busan: {
    name: 'Busan',
    courses: {
      dawn: [
        {
          place: 'Sunrise at Haeundae Beach',
          note: 'The beach faces east, so the sun rises right in front of you.',
        },
        {
          place: 'A bowl of dwaeji-gukbap (pork and rice soup)',
          note: 'Plenty of gukbap places open early in the morning.',
        },
        {
          place: 'Igidae Coastal Walk',
          note: 'A rocky path by the sea, so wear sneakers.',
        },
        {
          place: 'Oryukdo Skywalk',
          note: 'At the end of the trail, walk a glass path over the sea.',
        },
      ],
      food: [
        {
          place: 'Bupyeong Kkangtong Market',
          note: 'Start the day with fish cakes and street snacks.',
        },
        {
          place: 'Cold milmyeon noodles',
          note: 'A summer favorite you have to try in Busan.',
        },
        {
          place: 'Street snacks in Nampo-dong',
          note: 'Wander the alleys with a seed-filled hotteok (sweet pancake).',
        },
        {
          place: 'Raw fish at Jagalchi Market',
          note: 'At many places, you pick on the first floor and eat on the second.',
        },
      ],
      slow: [
        {
          place: 'Huinnyeoul Culture Village',
          note: 'A cliffside village above the sea. People live here, so walk quietly.',
        },
        {
          place: 'Huinnyeoul Coastal Tunnel walk',
          note: 'Take your time on the seaside path below the village.',
        },
        {
          place: 'Bosu-dong Book Street',
          note: 'Old secondhand bookshops line the alley.',
        },
        {
          place: 'Sunset at Dadaepo Beach',
          note: 'The sunset spreads wide over the broad sand.',
        },
      ],
      mood: [
        {
          place: 'Cheongsapo Daritdol Skywalk',
          note: 'Watch the morning from a deck stretching over the sea.',
        },
        {
          place: 'F1963',
          note: 'A culture space in a converted old factory. Great for photos.',
        },
        {
          place: 'Gamcheon Culture Village',
          note: 'A colorful hillside village of stairs. People live here, so keep it quiet.',
        },
        {
          place: 'Sunset at Gwangalli Beach',
          note: 'Once the sun sets, Gwangan Bridge lights up.',
        },
      ],
      night: [
        {
          place: 'Walk on Gwangalli Beach',
          note: 'Watch the sunset as you walk the sand.',
        },
        {
          place: 'Raw fish alley in Gwangalli',
          note: 'Grab a seat with a sea view first.',
        },
        {
          place: 'Gwangan Bridge at night',
          note: 'Sit on the beach and watch the bridge lights.',
        },
        {
          place: 'Haeundae Marine City at night',
          note: 'Tower lights reflect on the water.',
        },
      ],
      spont: [
        {
          place: 'Surf lesson at Songjeong Beach',
          note: 'Lots of beginner lessons here. Check the waves on the day.',
        },
        {
          place: 'Gijang Market',
          note: 'See the seasonal seafood and eat it right there.',
        },
        {
          place: 'Ride the Beach Train',
          note: 'Follow the seaside tracks all the way to Mipo.',
        },
        {
          place: 'Haeridan-gil alleys',
          note: 'Step into any shop that catches your eye along the old rail line.',
        },
      ],
      plan: [
        {
          place: 'Gamcheon Culture Village',
          note: 'Look around before the tour groups arrive.',
        },
        {
          place: 'Lunch at Jagalchi Market',
          note: 'It sits right next to Nampo-dong, so the route flows well.',
        },
        {
          place: 'Taejongdae',
          note: 'Loop the seaside cliff trail on the little tour train.',
        },
        {
          place: 'Ocean-view dinner in Gwangalli',
          note: 'Book a night-view seat ahead to keep it easy.',
        },
      ],
      market: [
        {
          place: 'Bujeon Market',
          note: 'One of the biggest traditional markets in Busan.',
        },
        {
          place: 'Gukje Market',
          note: "Each alley sells something different, so there's lots to see.",
        },
        {
          place: 'Bupyeong Kkangtong Market',
          note: 'Pick up fish cakes and snacks as souvenirs.',
        },
        {
          place: 'Bupyeong Kkangtong Night Market',
          note: 'Make the rounds of the food stalls that open in the evening.',
        },
      ],
    },
  },
  gangneung: {
    name: 'Gangneung',
    courses: {
      dawn: [
        {
          place: 'Sunrise at Jeongdongjin Beach',
          note: 'A famous sunrise spot, so go early for a good place.',
        },
        {
          place: 'Chodang sundubu (soft tofu)',
          note: 'Breakfast on tofu set with seawater.',
        },
        {
          place: 'Gyeongpoho Lake trail',
          note: 'A flat path that follows the lake.',
        },
        {
          place: 'Anmok Beach Coffee Street',
          note: 'Take a break with a view of the sea.',
        },
      ],
      food: [
        {
          place: 'Chodang Sundubu Village',
          note: 'A neighborhood full of soft tofu restaurants.',
        },
        {
          place: 'Gangneung Jungang Market',
          note: 'Try sweet crispy chicken and spicy knife-cut noodles.',
        },
        {
          place: 'Anmok Beach Coffee Street',
          note: 'Where every Gangneung café tour begins.',
        },
        {
          place: 'Jumunjin Fish Market',
          note: 'Pick from the seafood that came in that day.',
        },
      ],
      slow: [
        {
          place: 'Café at Anmok Beach',
          note: 'Spend the morning by a window with a sea view.',
        },
        {
          place: 'Walk around Gyeongpoho Lake',
          note: 'Stroll slowly along the shore.',
        },
        {
          place: 'Ojukheon',
          note: 'A quiet old house with a black bamboo grove.',
        },
        {
          place: 'Sunset at Gangmun Beach',
          note: 'A quieter beach than Gyeongpo.',
        },
      ],
      mood: [
        {
          place: 'Sunrise at Gyeongpo Beach',
          note: 'The sun rises over a wide stretch of sand.',
        },
        {
          place: 'Haslla Art World',
          note: 'A hilltop art museum overlooking the sea.',
        },
        {
          place: 'Myeongju-dong alleys',
          note: 'An old town of historic buildings and small cafés.',
        },
        {
          place: 'Sacheonjin Beach',
          note: 'A quiet beach that makes for great sunset photos.',
        },
      ],
      night: [
        {
          place: 'Walk on Gyeongpo Beach',
          note: 'Feel the sea breeze as the sun goes down.',
        },
        {
          place: 'Walk along Wolhwa Street',
          note: 'Follow a street built on an old railway line.',
        },
        {
          place: 'Gyo-dong at night',
          note: 'Lots of places here stay open late.',
        },
        {
          place: 'Gyeongpo Beach at night',
          note: 'Wrap up the day to the sound of the waves.',
        },
      ],
      spont: [
        {
          place: 'Surf lesson at Geumjin Beach',
          note: 'Check the waves that morning.',
        },
        {
          place: 'Seaside mulhoe (cold raw fish soup) spot',
          note: 'Walk into a local restaurant with a sea view.',
        },
        {
          place: 'Jeongdongsimgok Badabuchae-gil',
          note: 'A trail along the sea cliffs. It closes when the wind is strong.',
        },
        {
          place: 'Dinner in Myeongju-dong',
          note: 'Eat at whichever alley restaurant draws you in.',
        },
      ],
      plan: [
        {
          place: 'Sunrise at Jeongdongjin',
          note: 'Staying nearby makes it easy.',
        },
        {
          place: 'Jeongdongsimgok Badabuchae-gil',
          note: 'It starts right from Jeongdongjin.',
        },
        {
          place: 'Chodang sundubu lunch',
          note: 'Go just before lunchtime for a shorter wait.',
        },
        {
          place: 'Gyeongpoho Lake and Gyeongpodae Pavilion',
          note: 'Do a loop before sunset.',
        },
      ],
      market: [
        {
          place: 'Gangneung Jungang Market',
          note: 'Sweet crispy chicken is a favorite souvenir.',
        },
        {
          place: 'Seongnam Market',
          note: 'It sits right next to Jungang Market, so see both.',
        },
        {
          place: 'Jumunjin Fish Market',
          note: 'Pick up dried seafood and jeotgal (salted seafood).',
        },
        {
          place: 'Coffee bean shop in Anmok',
          note: 'Buy Gangneung coffee beans as gifts.',
        },
      ],
    },
  },
  seoul: {
    name: 'Seoul',
    courses: {
      dawn: [
        {
          place: 'Sunrise walk on Inwangsan',
          note: 'Follow the fortress wall up and watch the sun rise over the city.',
        },
        {
          place: 'Morning gukbap in Seochon',
          note: 'Warm up after coming down the mountain.',
        },
        {
          place: 'Gyeongbokgung Palace',
          note: 'Look around before the crowds arrive.',
        },
        {
          place: 'Cheonggyecheon Stream walk',
          note: 'Follow the stream right through downtown.',
        },
      ],
      food: [
        {
          place: 'Gwangjang Market',
          note: 'Breakfast on mung bean pancakes and mini gimbap.',
        },
        {
          place: 'Old-school eateries in Euljiro',
          note: 'Long-running restaurants cluster here.',
        },
        {
          place: 'Mangwon Market',
          note: 'Try croquettes and snacks one by one.',
        },
        {
          place: 'Dinner in Yeonnam-dong',
          note: 'Every alley has small restaurants.',
        },
      ],
      slow: [
        {
          place: 'Alley café in Seochon',
          note: 'Spend the morning in a small café among hanok houses.',
        },
        {
          place: 'Bukchon Hanok Village',
          note: 'People live here, so walk quietly.',
        },
        {
          place: 'Neighborhood bookshop',
          note: 'Seochon and Bukchon have many small bookshops.',
        },
        {
          place: 'Sunset at Naksan Park',
          note: 'Watch the city sunset from the fortress wall.',
        },
      ],
      mood: [
        {
          place: 'Namsan trail',
          note: 'Walk while the morning air is clear.',
        },
        {
          place: 'MMCA Seoul',
          note: 'Right next to Gyeongbokgung, so it fits the route.',
        },
        {
          place: 'Gift shops in Seongsu-dong',
          note: 'Lots of small brand shops in one place.',
        },
        {
          place: 'Sunset on Nodeul Island',
          note: 'Watch the sunset from the middle of the Han River.',
        },
      ],
      night: [
        {
          place: 'N Seoul Tower at night',
          note: 'Go up at sunset to see both day and night.',
        },
        {
          place: 'Euljiro Nogari Alley',
          note: 'Tables fill the alley every evening.',
        },
        {
          place: 'Ikseon-dong hanok alleys',
          note: 'Hanok shops look lovely lit up at night.',
        },
        {
          place: 'Night walk by the Han River',
          note: 'End the day in the river breeze.',
        },
      ],
      spont: [
        {
          place: 'Ttareungyi bike ride to the Han River',
          note: 'Rent a public bike and ride along the river.',
        },
        {
          place: 'Lunch at a neighborhood market',
          note: 'Step into any market you pass.',
        },
        {
          place: "A neighborhood you've never been to",
          note: 'Get off at any subway station and walk.',
        },
        {
          place: 'Sunset at Mangwon Hangang Park',
          note: 'Watch the sunset with convenience-store ramyeon.',
        },
      ],
      plan: [
        {
          place: 'Gyeongbokgung Palace',
          note: 'Look around before the crowds arrive.',
        },
        {
          place: 'Bukchon Hanok Village',
          note: 'An easy walk from Gyeongbokgung.',
        },
        {
          place: 'Insadong',
          note: 'Souvenir shops and traditional teahouses in one place.',
        },
        {
          place: 'Dinner, booked ahead',
          note: 'Weekend dinners are easier if you book ahead.',
        },
      ],
      market: [
        {
          place: 'Namdaemun Market',
          note: 'Many shops open early in the morning.',
        },
        {
          place: 'Gwangjang Market',
          note: 'Have lunch in the food alley.',
        },
        {
          place: 'Dongdaemun shopping malls',
          note: 'Browse fabric and accessory shops.',
        },
        {
          place: 'Mangwon Market',
          note: 'Pick up evening snacks and side dishes.',
        },
      ],
    },
  },
};
