// js/survey_phase.js
import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

const firebaseConfig = {
    apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
    authDomain: "real-surveys.firebaseapp.com",
    projectId: "real-surveys",
    storageBucket: "real-surveys.appspot.com",
    messagingSenderId: "1024139519354",
    appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentPhase = 1; // Default phase (1 to 5)

async function getCurrentPhase() {
    const phaseRef = doc(db, 'survey_phases', 'current');
    try {
        const docSnap = await getDoc(phaseRef);
        if (docSnap.exists()) {
            currentPhase = docSnap.data().phase;
            console.log(`Current survey phase: ${currentPhase}`);
        } else {
            console.log('No phase data found, using default phase 1');
        }
        return currentPhase;
    } catch (error) {
        console.error('Error fetching phase:', error);
        return currentPhase;
    }
}

async function updateSurveyPhase(newPhase) {
    if (newPhase < 1 || newPhase > 5) {
        console.error('Phase must be between 1 and 5');
        return;
    }
    const phaseRef = doc(db, 'survey_phases', 'current');
    try {
        await updateDoc(phaseRef, { phase: newPhase });
        currentPhase = newPhase;
        console.log(`Survey phase updated to: ${currentPhase}`);
    } catch (error) {
        console.error('Error updating phase:', error);
    }
}

async function checkSurveyAvailability(surveyId, userId) {
    const surveyRef = doc(db, 'surveys', `${surveyId}_${userId}`);
    const phaseRef = doc(db, 'survey_phases', 'current');
    try {
        const [surveySnap, phaseSnap] = await Promise.all([getDoc(surveyRef), getDoc(phaseRef)]);
        const isTaken = surveySnap.exists();
        const currentPhase = phaseSnap.exists() ? phaseSnap.data().phase : 1;
        const surveyPhase = surveySnap.exists() ? surveySnap.data().meta.phase || 1 : currentPhase;

        return {
            isTaken: isTaken,
            isActive: surveyPhase === currentPhase || !isTaken,
            currentPhase: currentPhase
        };
    } catch (error) {
        console.error('Error checking survey availability:', error);
        return { isTaken: false, isActive: false, currentPhase: 1 };
    }
}

// Placeholder for manual dashboard update (to be implemented later)
function updatePhaseManually(newPhase) {
    console.log(`Manually updating phase to ${newPhase} (Dashboard action required)`);
    updateSurveyPhase(newPhase);
}

// Export functions for use in other files
export { getCurrentPhase, updateSurveyPhase, checkSurveyAvailability, updatePhaseManually };