import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('===============================================================');
console.log(' PULSEFIT WORKOUT PLANNER — PRINT & PDF LAYOUT REGRESSION TEST');
console.log('===============================================================\n');

let passedTests = 0;
let totalTests = 0;

function assertTest(name, condition, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? `— ${details}` : ''}`);
  }
}

// -----------------------------------------------------------------------------
// 1. CSS & STYLESHEET REGRESSION CHECKS
// -----------------------------------------------------------------------------
console.log('--- 1. Print Stylesheet Inspection (frontend/src/index.css) ---');

const cssPath = path.resolve('..', 'frontend', 'src', 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

assertTest(
  'A4 Page declaration exists',
  cssContent.includes('@page') && cssContent.includes('size: A4 portrait')
);

assertTest(
  'Screen workout view is hidden in print',
  cssContent.includes('.screen-workout-view') && cssContent.includes('display: none !important')
);

assertTest(
  'Print workout container is displayed full width',
  cssContent.includes('#workout-plan-print-view') &&
  cssContent.includes('.print-workout-container') &&
  cssContent.includes('display: block !important') &&
  cssContent.includes('width: 100% !important')
);

assertTest(
  'Height, overflow, and position constraints reset in print container',
  cssContent.includes('.print-workout-container') &&
  cssContent.includes('height: auto !important') &&
  cssContent.includes('min-height: 0 !important') &&
  cssContent.includes('overflow: visible !important') &&
  cssContent.includes('position: static !important')
);

assertTest(
  'Exercise cards prevent awkward page breaks (break-inside: avoid)',
  cssContent.includes('.exercise-print-card') &&
  cssContent.includes('break-inside: avoid !important') &&
  cssContent.includes('page-break-inside: avoid !important')
);

assertTest(
  'Workout day container allows natural flow (break-inside: auto)',
  cssContent.includes('.workout-day-print-card') &&
  cssContent.includes('break-inside: auto !important') &&
  cssContent.includes('page-break-inside: auto !important')
);

assertTest(
  'Day header avoids break after (break-after: avoid)',
  cssContent.includes('.workout-day-header') &&
  cssContent.includes('break-after: avoid !important')
);

// -----------------------------------------------------------------------------
// 2. COMPONENT DOM & STRUCTURE VALIDATION (PrintWorkoutView.jsx)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Print Component Code Inspection (PrintWorkoutView.jsx) ---');

const printViewPath = path.resolve('..', 'frontend', 'src', 'components', 'WorkoutPlan', 'PrintWorkoutView.jsx');
const printViewContent = fs.readFileSync(printViewPath, 'utf8');

assertTest(
  'PrintWorkoutView has root id "workout-plan-print-view" and class "print-workout-container"',
  printViewContent.includes('id="workout-plan-print-view"') &&
  printViewContent.includes('print-workout-container')
);

assertTest(
  'Contains PulseFit Gym Branded Header',
  printViewContent.includes('config.gymName') &&
  printViewContent.includes('OFFICIAL 7-DAY WORKOUT BLUEPRINT')
);

assertTest(
  'Displays Member Profile & Baseline Metrics (Goal, Experience, Frequency, Duration)',
  printViewContent.includes('effectiveGoal') &&
  printViewContent.includes('experienceLevel') &&
  printViewContent.includes('daysPerWeek') &&
  printViewContent.includes('durationMins')
);

assertTest(
  'Renders all 7 days sequentially with Day Names & Focus',
  printViewContent.includes('daysList.map') &&
  printViewContent.includes('dayObj.focus') &&
  printViewContent.includes('dayLabel')
);

assertTest(
  'Renders warm-up and cool-down sections when present',
  printViewContent.includes('dayObj.warmup') &&
  printViewContent.includes('dayObj.cooldown')
);

assertTest(
  'Renders single-column exercise cards with sets, reps, rest, and form cues',
  printViewContent.includes('exercise-print-card') &&
  printViewContent.includes('exercise.sets') &&
  printViewContent.includes('exercise.reps') &&
  printViewContent.includes('exercise.rest') &&
  printViewContent.includes('exercise.instructions || exercise.cues')
);

assertTest(
  'Renders Rest & Recovery day cards properly',
  printViewContent.includes('isRest') &&
  printViewContent.includes('recoveryNote')
);

assertTest(
  'Includes Physical Safety & Form Advisory disclaimer',
  printViewContent.includes('safety_caution') || printViewContent.includes('safetyTitle')
);

assertTest(
  'Includes Trainer Support & Desk Contact footer',
  printViewContent.includes('deskLocation') || printViewContent.includes('Trainer Station')
);

// -----------------------------------------------------------------------------
// 3. WORKOUT PLAN PAGE INTEGRATION (WorkoutPlan.jsx)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Page Level Integration (WorkoutPlan.jsx) ---');

const pagePath = path.resolve('..', 'frontend', 'src', 'pages', 'WorkoutPlan.jsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

assertTest(
  'WorkoutPlan imports and renders PrintWorkoutView',
  pageContent.includes("import PrintWorkoutView from '../components/WorkoutPlan/PrintWorkoutView'") &&
  pageContent.includes('<PrintWorkoutView customerData={customerData}')
);

assertTest(
  'Interactive screen view is cleanly wrapped in .screen-workout-view.print:hidden',
  pageContent.includes('className="screen-workout-view print:hidden')
);

assertTest(
  'Interactive buttons and navigation tabs are hidden on print',
  pageContent.includes('print:hidden')
);

// -----------------------------------------------------------------------------
// 4. TEST MULTIPLE WORKOUT SCENARIOS WITH HEADLESS CHROME
// -----------------------------------------------------------------------------
console.log('\n--- 4. Headless Chrome PDF Generation Test Across Workout Scenarios ---');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const chromeExe = chromePaths.find(p => fs.existsSync(p));

if (!chromeExe) {
  console.log('  ⚠️ Chrome executable not found for headless PDF test. Skipping PDF render.');
} else {
  const testOutputDir = path.resolve('..', 'Test_PDF');
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }

  // Define test cases
  const scenarios = [
    {
      id: '5day_muscle_gain',
      title: '5 Days/Wk — Muscle Gain — Intermediate (45 Mins)',
      customer: {
        name: 'Alex Mercer',
        age: 28,
        gender: 'Male',
        height: 178,
        weight: 76,
        fitnessGoal: 'Muscle Gain',
        experienceLevel: 'Intermediate',
        daysPerWeek: 5,
        durationMins: 45,
        equipment: 'Full Commercial Gym (Barbells, Dumbbells, Cables, Machines)',
        injuries: 'None',
        preferredExercises: 'Bench press, Squats, Pull-ups',
        email: 'alex.mercer@pulsefit-member.com',
        phone: '+91 98765 11223'
      },
      plan: {
        days: [
          {
            day: 1,
            day_name: 'Monday (Day 1)',
            focus: 'Chest & Triceps Hypertrophy',
            is_rest_day: false,
            warmup: '5 mins dynamic chest openers, arm circles, light push-ups',
            exercises: [
              { name: 'Barbell Bench Press', sets: '4', reps: '8-10', rest: '90s', instructions: 'Retract scapulae, touch lower chest with control.' },
              { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', rest: '75s', instructions: 'Set bench to 30 degrees, full stretch at bottom.' },
              { name: 'Cable Chest Flyes', sets: '3', reps: '12-15', rest: '60s', instructions: 'Squeeze at peak contraction, keep slight elbow bend.' },
              { name: 'Overhead Rope Tricep Extension', sets: '3', reps: '12-15', rest: '60s', instructions: 'Flare ropes at top, keep elbows locked in place.' },
              { name: 'Dips / Weighted Dips', sets: '3', reps: '10-12', rest: '60s', instructions: 'Lean slightly forward to target lower chest/triceps.' }
            ],
            cooldown: '5 mins static chest and shoulder stretches, foam rolling'
          },
          {
            day: 2,
            day_name: 'Tuesday (Day 2)',
            focus: 'Back & Biceps Power',
            is_rest_day: false,
            warmup: '5 mins band pull-aparts, cat-cow stretch, dead hangs',
            exercises: [
              { name: 'Conventional Deadlift', sets: '4', reps: '6-8', rest: '120s', instructions: 'Brace core, neutral spine, drive through heels.' },
              { name: 'Lat Pulldowns (Wide Grip)', sets: '4', reps: '10-12', rest: '75s', instructions: 'Pull to upper chest, drive elbows down.' },
              { name: 'Single-Arm Dumbbell Row', sets: '3', reps: '10-12 each', rest: '60s', instructions: 'Keep torso parallel to floor, row towards hip.' },
              { name: 'Incline Dumbbell Bicep Curls', sets: '3', reps: '12', rest: '60s', instructions: 'Full supination at top, slow 2s eccentric.' },
              { name: 'Hammer Curls (Rope)', sets: '3', reps: '12-15', rest: '60s', instructions: 'Target brachialis, avoid swinging momentum.' }
            ],
            cooldown: '5 mins lat and lower back stretching'
          },
          {
            day: 3,
            day_name: 'Wednesday (Day 3)',
            focus: 'Legs & Core Conditioning',
            is_rest_day: false,
            warmup: '5 mins bodyweight squats, hip openers, leg swings',
            exercises: [
              { name: 'Barbell Back Squat', sets: '4', reps: '8-10', rest: '120s', instructions: 'Hit parallel, keep chest proud and knees tracking toes.' },
              { name: 'Romanian Deadlift (RDL)', sets: '3', reps: '10-12', rest: '90s', instructions: 'Push hips back, feel hamstring stretch, maintain flat back.' },
              { name: 'Leg Press (45 Degree)', sets: '3', reps: '12-15', rest: '75s', instructions: 'Feet shoulder-width, avoid locking knees at top.' },
              { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '45s', instructions: 'Pause 1s at top contraction and 1s at bottom stretch.' },
              { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s', instructions: 'Curl pelvis up, control the descent without swinging.' }
            ],
            cooldown: '5 mins quad, hamstring, and hip flexor stretches'
          },
          {
            day: 4,
            day_name: 'Thursday (Day 4)',
            focus: 'Active Rest & Mobility',
            is_rest_day: true,
            warmup: null,
            exercises: [],
            recoveryNote: 'Light 30-minute outdoor walk, full-body foam rolling, and 15 mins mobility drills. Prioritize hydration and 8 hours sleep.',
            cooldown: null
          },
          {
            day: 5,
            day_name: 'Friday (Day 5)',
            focus: 'Shoulders & Arms Volume',
            is_rest_day: false,
            warmup: '5 mins shoulder dislocates, face pulls, rotator cuff rotations',
            exercises: [
              { name: 'Seated Dumbbell Shoulder Press', sets: '4', reps: '8-10', rest: '90s', instructions: 'Press overhead without arching lower back.' },
              { name: 'Lateral Cable Raises', sets: '4', reps: '12-15', rest: '60s', instructions: 'Lead with elbows, slight forward lean.' },
              { name: 'Reverse Pec Deck / Rear Delt Fly', sets: '3', reps: '15', rest: '60s', instructions: 'Focus on posterior delts, don’t pinch rhomboids excessively.' },
              { name: 'EZ-Bar Skull Crushers', sets: '3', reps: '10-12', rest: '60s', instructions: 'Lower bar to crown of head, keep elbows tucked.' },
              { name: 'Preacher Bicep Curls', sets: '3', reps: '10-12', rest: '60s', instructions: 'Strict form against pad, isolate biceps.' }
            ],
            cooldown: '5 mins deltoid and arm stretches'
          },
          {
            day: 6,
            day_name: 'Saturday (Day 6)',
            focus: 'Full Body Functional & Core',
            is_rest_day: false,
            warmup: '5 mins jumping jacks, world’s greatest stretch, glute bridges',
            exercises: [
              { name: 'Barbell Walking Lunges', sets: '3', reps: '12 steps/leg', rest: '75s', instructions: 'Keep torso upright, knee lightly taps floor.' },
              { name: 'Kettlebell Swings', sets: '3', reps: '20', rest: '60s', instructions: 'Snap hips explosively, maintain neutral spine.' },
              { name: 'Pull-Ups / Chin-Ups', sets: '3', reps: '8-10', rest: '75s', instructions: 'Full extension at bottom, chin over bar.' },
              { name: 'Ab Wheel Rollouts', sets: '3', reps: '12', rest: '60s', instructions: 'Tuck pelvis, roll out only as far as back stays flat.' }
            ],
            cooldown: '5 mins total body relaxation and yoga stretching'
          },
          {
            day: 7,
            day_name: 'Sunday (Day 7)',
            focus: 'Rest & Complete Recovery',
            is_rest_day: true,
            warmup: null,
            exercises: [],
            recoveryNote: 'Complete physical recovery. Enjoy quality family time, prepare meals for the upcoming training week, and hydrate well.',
            cooldown: null
          }
        ],
        safety_caution: 'Maintain strict lifting form over heavy weights. Ensure 90-second rest intervals on compound lifts.'
      }
    },
    {
      id: '3day_beginner_routine',
      title: '3 Days/Wk — General Fitness — Beginner (45 Mins)',
      customer: {
        name: 'Sarah Jenkins',
        age: 34,
        gender: 'Female',
        height: 165,
        weight: 62,
        fitnessGoal: 'General Fitness',
        experienceLevel: 'Beginner',
        daysPerWeek: 3,
        durationMins: 45,
        equipment: 'Dumbbells and Resistance Bands',
        injuries: 'Mild lower back sensitivity',
        preferredExercises: 'Goblet squats, Dumbbell presses, Glute bridges',
        email: 'sarah.j@pulsefit-member.com',
        phone: '+91 98765 44332'
      },
      plan: {
        days: [
          {
            day: 1,
            day_name: 'Monday (Day 1)',
            focus: 'Full Body Foundations A',
            is_rest_day: false,
            warmup: '5 mins arm circles, torso twists, gentle hip circles',
            exercises: [
              { name: 'Goblet Squat', sets: '3', reps: '10-12', rest: '60s', instructions: 'Hold dumbbell close to chest, keep heels firmly planted.' },
              { name: 'Flat Dumbbell Press', sets: '3', reps: '10-12', rest: '60s', instructions: 'Control movement down, press up smoothly.' },
              { name: 'Dumbbell Bent-Over Row', sets: '3', reps: '10-12', rest: '60s', instructions: 'Hinge at hips, keep spine neutral, pull elbows back.' }
            ],
            cooldown: '5 mins gentle full body stretch'
          },
          { day: 2, day_name: 'Tuesday (Day 2)', focus: 'Rest & Recovery', is_rest_day: true, recoveryNote: 'Light walking and gentle stretching.' },
          {
            day: 3,
            day_name: 'Wednesday (Day 3)',
            focus: 'Full Body Foundations B',
            is_rest_day: false,
            warmup: '5 mins dynamic warm-up and marching in place',
            exercises: [
              { name: 'Dumbbell Romanian Deadlift', sets: '3', reps: '10-12', rest: '60s', instructions: 'Soft knee bend, push hips back, do not round lower back.' },
              { name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '10-12', rest: '60s', instructions: 'Press gently overhead, keep core engaged.' },
              { name: 'Glute Bridge (Floor)', sets: '3', reps: '15', rest: '45s', instructions: 'Squeeze glutes at top for 2 seconds.' }
            ],
            cooldown: '5 mins stretching'
          },
          { day: 4, day_name: 'Thursday (Day 4)', focus: 'Rest & Recovery', is_rest_day: true, recoveryNote: 'Hydrate well and light yoga.' },
          {
            day: 5,
            day_name: 'Friday (Day 5)',
            focus: 'Full Body Foundations C',
            is_rest_day: false,
            warmup: '5 mins mobility and breathing work',
            exercises: [
              { name: 'Dumbbell Step-Ups / Reverse Lunges', sets: '3', reps: '10 each leg', rest: '60s', instructions: 'Step down softly, keep front knee stable.' },
              { name: 'Resistance Band Lat Pulldown', sets: '3', reps: '12-15', rest: '45s', instructions: 'Squeeze shoulder blades together.' },
              { name: 'Plank on Knees/Forearms', sets: '3', reps: '30-40s', rest: '45s', instructions: 'Maintain straight line from shoulders to hips.' }
            ],
            cooldown: '5 mins relaxation'
          },
          { day: 6, day_name: 'Saturday (Day 6)', focus: 'Active Weekend Recovery', is_rest_day: true, recoveryNote: 'Leisure walk and recreation.' },
          { day: 7, day_name: 'Sunday (Day 7)', focus: 'Rest & Preparation', is_rest_day: true, recoveryNote: 'Full body rest.' }
        ],
        safety_caution: 'Listen to your body. Avoid heavy spinal loading due to lower back sensitivity.'
      }
    },
    {
      id: '6day_advanced_strength',
      title: '6 Days/Wk — Strength Training — Advanced (60 Mins)',
      customer: {
        name: 'Marcus Vance',
        age: 26,
        gender: 'Male',
        height: 185,
        weight: 90,
        fitnessGoal: 'Strength Training',
        experienceLevel: 'Advanced',
        daysPerWeek: 6,
        durationMins: 60,
        equipment: 'Full Powerlifting Gym Setup',
        injuries: 'None',
        preferredExercises: 'Squat, Bench, Deadlift, Overhead Press',
        email: 'marcus.v@pulsefit-member.com',
        phone: '+91 98765 88990'
      },
      plan: {
        days: [
          {
            day: 1, day_name: 'Monday (Day 1)', focus: 'Push Strength (Heavy Chest & Shoulders)', is_rest_day: false,
            warmup: '10 mins shoulder activation and warmup sets',
            exercises: [
              { name: 'Heavy Barbell Bench Press', sets: '5', reps: '5', rest: '180s', instructions: 'High arch leg drive, explosive concentric.' },
              { name: 'Standing Overhead Press (OHP)', sets: '4', reps: '6', rest: '120s', instructions: 'Lock out overhead with active traps.' },
              { name: 'Weighted Dips', sets: '4', reps: '8', rest: '90s', instructions: 'Full range of motion, controlled tempo.' },
              { name: 'Incline Dumbbell Flyes', sets: '3', reps: '12', rest: '60s', instructions: 'Deep stretch, emphasize chest contraction.' }
            ],
            cooldown: '5 mins upper body mobility'
          },
          {
            day: 2, day_name: 'Tuesday (Day 2)', focus: 'Pull Strength (Heavy Back & Biceps)', is_rest_day: false,
            warmup: '10 mins lat activation and thoracic spine mobility',
            exercises: [
              { name: 'Barbell Deadlift (Sumo/Conv)', sets: '5', reps: '3-5', rest: '180s', instructions: 'Lock out with glutes, reset each rep.' },
              { name: 'Weighted Pull-Ups', sets: '4', reps: '6-8', rest: '120s', instructions: 'Dead hang to chest to bar.' },
              { name: 'Pendlay Barbell Rows', sets: '4', reps: '8', rest: '90s', instructions: 'From floor each rep, explosive pull.' },
              { name: 'Barbell Bicep Curls', sets: '3', reps: '10', rest: '60s', instructions: 'Strict form, no swinging.' }
            ],
            cooldown: '5 mins back decompression'
          },
          {
            day: 3, day_name: 'Wednesday (Day 3)', focus: 'Legs (Squat Focus)', is_rest_day: false,
            warmup: '10 mins hip mobility, ankle stretches, goblet squat holds',
            exercises: [
              { name: 'Competition Barbell Back Squat', sets: '5', reps: '5', rest: '180s', instructions: 'Deep below parallel, drive up through midfoot.' },
              { name: 'Front Squats', sets: '3', reps: '6-8', rest: '120s', instructions: 'Clean grip or cross-arm, upright torso.' },
              { name: 'Glute Ham Developer / Leg Curls', sets: '3', reps: '10-12', rest: '75s', instructions: 'Control eccentric completely.' },
              { name: 'Standing Calf Raises', sets: '4', reps: '15', rest: '45s', instructions: 'Full stretch and peak squeeze.' }
            ],
            cooldown: '10 mins lower body stretches'
          },
          {
            day: 4, day_name: 'Thursday (Day 4)', focus: 'Push Hypertrophy (Delts & Triceps)', is_rest_day: false,
            warmup: '5 mins rotator cuff exercises',
            exercises: [
              { name: 'Incline Barbell Bench Press', sets: '4', reps: '8-10', rest: '90s', instructions: 'Touch clavicles, control descent.' },
              { name: 'Seated Dumbbell Shoulder Press', sets: '4', reps: '10-12', rest: '75s', instructions: 'Full range of motion.' },
              { name: 'Cable Lateral Raises', sets: '4', reps: '15', rest: '45s', instructions: 'Continuous tension on side delts.' },
              { name: 'Skull Crushers', sets: '3', reps: '12', rest: '60s', instructions: 'Strict elbow positioning.' }
            ],
            cooldown: '5 mins stretch'
          },
          {
            day: 5, day_name: 'Friday (Day 5)', focus: 'Pull Hypertrophy (Lats & Traps)', is_rest_day: false,
            warmup: '5 mins band pull aparts',
            exercises: [
              { name: 'Chest-Supported T-Bar Row', sets: '4', reps: '10-12', rest: '90s', instructions: 'Squeeze mid-back at top.' },
              { name: 'Neutral Grip Lat Pulldowns', sets: '4', reps: '10-12', rest: '75s', instructions: 'Full stretch at top.' },
              { name: 'Barbell Shrugs', sets: '4', reps: '12-15', rest: '60s', instructions: '2s pause at peak shrug.' },
              { name: 'Incline Hammer Curls', sets: '3', reps: '12', rest: '60s', instructions: 'Strict isolation.' }
            ],
            cooldown: '5 mins stretch'
          },
          {
            day: 6, day_name: 'Saturday (Day 6)', focus: 'Legs & Posterior Chain Hypertrophy', is_rest_day: false,
            warmup: '5 mins leg swings and foam rolling',
            exercises: [
              { name: 'Barbell Romanian Deadlift (RDL)', sets: '4', reps: '8-10', rest: '120s', instructions: 'Feel deep hamstring stretch.' },
              { name: 'Bulgarian Split Squats', sets: '3', reps: '10 each leg', rest: '90s', instructions: 'Knee tracking front toe, controlled tempo.' },
              { name: 'Leg Extensions', sets: '3', reps: '15', rest: '60s', instructions: 'Hold peak contraction 1s.' },
              { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45s', instructions: 'Controlled core flexion.' }
            ],
            cooldown: '5 mins foam rolling'
          },
          { day: 7, day_name: 'Sunday (Day 7)', focus: 'Rest & Full Recovery', is_rest_day: true, recoveryNote: 'Complete rest day. High protein intake and hydration.' }
        ],
        safety_caution: 'Warm up thoroughly before working sets. Use safety pins for all heavy squats and presses.'
      }
    }
  ];

  // Helper to build HTML corresponding to PrintWorkoutView
  function renderHtmlForScenario(scenario) {
    const { customer, plan } = scenario;
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let daysHtml = plan.days.map((dayObj, dayIdx) => {
      const currentDayNum = dayObj.day || dayIdx + 1;
      const isRest = Boolean(dayObj.is_rest_day || dayObj.focus?.toLowerCase().includes('rest') || dayObj.focus?.toLowerCase().includes('recovery'));

      let exercisesHtml = '';
      if (isRest) {
        exercisesHtml = `
          <div class="exercise-print-card avoid-break rest-card">
            <h4>🧘 Active Recovery & Rest Day</h4>
            <p>${dayObj.recoveryNote || 'Hydrate, prioritize quality sleep, and perform gentle mobility or light walking.'}</p>
          </div>
        `;
      } else {
        const exCards = (dayObj.exercises || []).map((ex, exIdx) => `
          <div class="exercise-print-card avoid-break">
            <div class="ex-header">
              <div class="ex-title">
                <span class="ex-num">${exIdx + 1}</span>
                <span class="ex-name">${ex.name}</span>
              </div>
              <div class="ex-badges">
                <span class="badge badge-sets">${ex.sets} Sets</span>
                <span class="badge badge-reps">${ex.reps} Reps</span>
                <span class="badge badge-rest">⏱️ ${ex.rest}</span>
              </div>
            </div>
            ${ex.instructions ? `<div class="ex-cues"><strong>💡 Form & Cues:</strong> ${ex.instructions}</div>` : ''}
          </div>
        `).join('');

        exercisesHtml = `<div class="exercises-list">${exCards}</div>`;
      }

      return `
        <div class="workout-day-print-card">
          <div class="workout-day-header ${isRest ? 'rest-day-header' : ''}">
            <div class="day-title-grp">
              <span class="day-num-badge">${currentDayNum}</span>
              <div>
                <span class="day-name">${dayObj.day_name || `Day ${currentDayNum}`}</span>
                <span class="day-focus">🎯 ${dayObj.focus}</span>
              </div>
            </div>
            <span class="day-status-pill">
              ${isRest ? '💤 Rest & Recovery' : `⚡ ${(dayObj.exercises || []).length} Exercises`}
            </span>
          </div>

          <div class="day-body">
            ${dayObj.warmup ? `<div class="avoid-break warmup-box"><strong>🔥 WARM-UP:</strong> ${dayObj.warmup}</div>` : ''}
            ${exercisesHtml}
            ${dayObj.cooldown ? `<div class="avoid-break cooldown-box"><strong>❄️ COOL-DOWN:</strong> ${dayObj.cooldown}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${customer.name} - PulseFit Workout Blueprint</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.35;
    }
    #workout-plan-print-view {
      display: block !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .print-workout-container, .print-workout-container * {
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      overflow: visible !important;
      position: static !important;
      box-shadow: none !important;
    }
    .avoid-break, .exercise-print-card {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .workout-day-print-card {
      break-inside: auto !important;
      page-break-inside: auto !important;
      margin-bottom: 14pt !important;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
    }
    .workout-day-header {
      break-after: avoid !important;
      page-break-after: avoid !important;
      background: #1e293b;
      color: #ffffff;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .rest-day-header {
      background: #334155;
    }
    .day-title-grp {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .day-num-badge {
      width: 22px;
      height: 22px;
      background: #10b981;
      color: #0f172a;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 11px;
    }
    .day-name {
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      display: block;
      color: #ffffff;
    }
    .day-focus {
      font-size: 10px;
      color: #6ee7b7;
      font-weight: 600;
      display: block;
    }
    .day-status-pill {
      font-size: 9.5px;
      background: #334155;
      padding: 3px 8px;
      border-radius: 4px;
      color: #e2e8f0;
      font-weight: 600;
    }
    .day-body {
      padding: 10px 12px;
    }
    .warmup-box {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 10.5px;
      color: #134e4a;
      margin-bottom: 8px;
    }
    .cooldown-box {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 10.5px;
      color: #312e81;
      margin-top: 8px;
    }
    .rest-card {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      color: #78350f;
    }
    .rest-card h4 {
      margin: 0 0 4px 0;
      font-size: 12px;
    }
    .rest-card p {
      margin: 0;
      font-size: 10.5px;
    }
    .exercises-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .exercise-print-card {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .ex-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .ex-title {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ex-num {
      width: 18px;
      height: 18px;
      background: #059669;
      color: #ffffff;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9.5px;
      font-weight: 800;
    }
    .ex-name {
      font-weight: 700;
      font-size: 11.5px;
      color: #0f172a;
    }
    .ex-badges {
      display: flex;
      gap: 5px;
      font-size: 9.5px;
    }
    .badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }
    .badge-sets {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .badge-reps {
      background: #ccfbf1;
      color: #115e59;
      border: 1px solid #99f6e4;
    }
    .badge-rest {
      background: #e2e8f0;
      color: #334155;
    }
    .ex-cues {
      font-size: 10px;
      color: #475569;
      padding-left: 24px;
      line-height: 1.35;
    }
    .doc-header {
      border-bottom: 2px solid #059669;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-badge {
      width: 40px;
      height: 40px;
      background: #059669;
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 900;
    }
    .gym-name {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
    }
    .gym-sub {
      font-size: 10px;
      font-weight: 700;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-right {
      text-align: right;
      font-size: 9px;
      color: #475569;
      line-height: 1.3;
    }
    .profile-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #f8fafc;
      overflow: hidden;
      margin-bottom: 14px;
    }
    .profile-card-header {
      background: #f1f5f9;
      padding: 6px 12px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #334155;
    }
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      padding: 10px 12px;
      font-size: 10.5px;
    }
    .profile-item span {
      display: block;
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .profile-item strong {
      color: #0f172a;
      font-size: 11px;
    }
    .profile-extra {
      padding: 6px 12px;
      background: #f1f5f9;
      border-top: 1px solid #cbd5e1;
      font-size: 9.5px;
      color: #475569;
    }
    .safety-card {
      border: 1px solid #fde68a;
      background: #fffbeb;
      border-radius: 8px;
      padding: 10px 12px;
      margin-top: 14px;
      font-size: 10px;
      color: #78350f;
    }
    .safety-card h4 {
      margin: 0 0 3px 0;
      font-size: 11px;
      font-weight: 800;
      color: #78350f;
    }
    .doc-footer {
      border-top: 2px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 14px;
      font-size: 9px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div id="workout-plan-print-view" class="print-workout-container">
    <!-- Header -->
    <header class="doc-header avoid-break">
      <div class="brand-left">
        <div class="logo-badge">⚡</div>
        <div>
          <h1 class="gym-name">PulseFit Fitness Hub</h1>
          <div class="gym-sub">Official Workout Blueprint</div>
        </div>
      </div>
      <div class="brand-right">
        <div><strong>+91 98765 43210</strong></div>
        <div>desk@pulsefitgym.com</div>
        <div>www.pulsefitgym.com</div>
        <div style="margin-top:3px; color:#64748b;">Generated on: ${formattedDate}</div>
      </div>
    </header>

    <!-- Profile -->
    <section class="profile-card avoid-break">
      <div class="profile-card-header">
        👤 Member Profile & Baseline Metrics
      </div>
      <div class="profile-grid">
        <div class="profile-item">
          <span>Member</span>
          <strong>${customer.name}</strong>
          <div>${customer.gender}, ${customer.age} yrs</div>
        </div>
        <div class="profile-item">
          <span>Goal & Experience</span>
          <strong style="color:#059669;">${customer.fitnessGoal}</strong>
          <div>${customer.experienceLevel}</div>
        </div>
        <div class="profile-item">
          <span>Body Stats</span>
          <strong>${customer.weight} kg</strong>
          <div>Ht: ${customer.height} cm</div>
        </div>
        <div class="profile-item">
          <span>Frequency & Duration</span>
          <strong>${customer.daysPerWeek} Days/Wk</strong>
          <div>${customer.durationMins} Mins/Session</div>
        </div>
      </div>
      <div class="profile-extra">
        <div><strong>Equipment:</strong> ${customer.equipment}</div>
        ${customer.injuries && customer.injuries !== 'None' ? `<div style="color:#92400e; margin-top:2px;"><strong>⚠️ Limitations:</strong> ${customer.injuries}</div>` : ''}
      </div>
    </section>

    <!-- Days Schedule -->
    <section class="workout-days-list">
      ${daysHtml}
    </section>

    <!-- Safety -->
    <section class="safety-card avoid-break">
      <h4>🛡️ Physical Safety & Form Advisory</h4>
      <div>${plan.safety_caution || 'This workout plan is for general guidance. Consult a physician before starting new routines.'}</div>
    </section>

    <!-- Footer -->
    <footer class="doc-footer avoid-break">
      <div><strong>PulseFit Fitness Hub</strong> • Gym Front Desk & Trainer Station</div>
      <div><strong>+91 98765 43210</strong> • Mon – Sat: 6:00 AM – 10:00 PM</div>
    </footer>
  </div>
</body>
</html>`;
  }

  for (const scenario of scenarios) {
    const htmlContent = renderHtmlForScenario(scenario);
    const tempHtmlPath = path.join(testOutputDir, `temp_workout_${scenario.id}.html`);
    const outputPdfPath = path.join(testOutputDir, `Workout_Plan_${scenario.id}.pdf`);

    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

    try {
      const cmd = `"${chromeExe}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "${tempHtmlPath}"`;
      execSync(cmd, { stdio: 'pipe', timeout: 30000 });

      const pdfExists = fs.existsSync(outputPdfPath);
      const pdfSize = pdfExists ? fs.statSync(outputPdfPath).size : 0;

      assertTest(
        `PDF generation for ${scenario.title}`,
        pdfExists && pdfSize > 5000,
        `Output: ${outputPdfPath} (${Math.round(pdfSize / 1024)} KB)`
      );

      // Clean up temp html
      if (fs.existsSync(tempHtmlPath)) {
        fs.unlinkSync(tempHtmlPath);
      }
    } catch (err) {
      assertTest(`PDF generation for ${scenario.title}`, false, err.message);
    }
  }
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(` TEST SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('===============================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL WORKOUT PLANNER PRINT REGRESSION TESTS PASSED CLEANLY!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED. Please review the output above.\n');
  process.exit(1);
}
