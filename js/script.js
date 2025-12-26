
// Splash Screen Handling


const splash = document.getElementById("splash-screen");

// Minimum splash time (5 seconds)
const MIN_TIME = 2000;
const startTime = Date.now();

window.addEventListener("load", () => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = MIN_TIME - elapsedTime;

    setTimeout(() => {
        splash.classList.add("hide-splash");

        setTimeout(() => {
            splash.style.display = "none";
        }, 300); // fade duration
    }, remainingTime > 0 ? remainingTime : 0);
});





// Show/Hide CAT Score Fields
// document.getElementById('hasCATScore').addEventListener('change', function () {
//     const catFields = document.getElementById('catScoreFields');
//     if (this.value === 'Yes') {
//         catFields.style.display = 'block';
//     } else {
//         catFields.style.display = 'none';
//     }
// });

const hasCAT = document.getElementById("hasCATScore");
const catFields = document.getElementById("catScoreFields");

if (hasCAT && catFields) {
    hasCAT.addEventListener("change", () => {
        catFields.style.display = hasCAT.value === "Yes" ? "block" : "none";
    });
}

// Predictor Form Submission
document.getElementById('predictorForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';
    document.querySelector('.btn-predict').disabled = true;

    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Simulate processing delay
    setTimeout(() => {
        const predictions = calculatePredictions(data);

        displayResults(predictions);

        // Hide spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        document.querySelector('.btn-predict').disabled = false;

        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }, 2000);
});

// Prediction Algorithm
function calculatePredictions(data) {
    const predictions = [];

    // Parse numeric values
    const catOverall = parseFloat(data.catOverall) || 0;
    const class10 = parseFloat(data.class10Percentage) || 0;
    const class12 = parseFloat(data.class12Percentage) || 0;
    const undergrad = parseFloat(data.undergradPercentage) || 0;
    const workEx = parseFloat(data.workExJuly) || 0;

    // Calculate composite score
    const academicScore = (class10 + class12 + undergrad) / 3;

    // IIM Prediction Logic (Simplified)
    const iims = [
        { name: 'IIM Ahmedabad', cutoff: 99.0, weight: 0.3 },
        { name: 'IIM Bangalore', cutoff: 98.5, weight: 0.35 },
        { name: 'IIM Calcutta', cutoff: 98.0, weight: 0.4 },
        { name: 'IIM Lucknow', cutoff: 96.0, weight: 0.5 },
        { name: 'IIM Indore', cutoff: 95.0, weight: 0.55 },
        { name: 'IIM Kozhikode', cutoff: 95.0, weight: 0.55 },
        { name: 'IIM Shillong', cutoff: 92.0, weight: 0.7 },
        { name: 'IIM Ranchi', cutoff: 92.0, weight: 0.7 },
        { name: 'IIM Raipur', cutoff: 91.0, weight: 0.75 },
        { name: 'IIM Rohtak', cutoff: 91.0, weight: 0.75 },
        { name: 'IIM Kashipur', cutoff: 90.0, weight: 0.8 },
        { name: 'IIM Trichy', cutoff: 90.0, weight: 0.8 },
        { name: 'IIM Udaipur', cutoff: 90.0, weight: 0.8 }
    ];

    iims.forEach(iim => {
        if (catOverall >= iim.cutoff - 5) { // Allow 5 percentile buffer for prediction
            let chance = 0;

            // Calculate chance based on CAT score
            if (catOverall >= iim.cutoff + 1) {
                chance = 85 + (catOverall - iim.cutoff) * 2;
            } else if (catOverall >= iim.cutoff) {
                chance = 70 + (catOverall - iim.cutoff + 1) * 5;
            } else if (catOverall >= iim.cutoff - 2) {
                chance = 50 + (catOverall - iim.cutoff + 2) * 10;
            } else {
                chance = 30 + (catOverall - iim.cutoff + 5) * 4;
            }

            // Adjust based on academics
            if (academicScore >= 80) {
                chance += 5;
            } else if (academicScore < 60) {
                chance -= 10;
            }

            // Adjust based on work experience
            if (workEx >= 2) {
                chance += 5;
            }

            // Category bonus
            if (data.category !== 'General') {
                chance += 10;
            }

            // Cap at 95%
            chance = Math.min(chance, 95);
            chance = Math.max(chance, 5);

            predictions.push({
                college: iim.name,
                chance: Math.round(chance),
                percentile: catOverall
            });
        }
    });

    // Sort by chance
    predictions.sort((a, b) => b.chance - a.chance);

    // If no predictions (low CAT score), add encouraging message
    if (predictions.length === 0 && catOverall > 0) {
        predictions.push({
            college: 'Keep Working Hard!',
            chance: 0,
            message: 'Your current profile needs improvement. Focus on improving your CAT score to 90+ percentile for better chances.'
        });
    } else if (catOverall === 0) {
        predictions.push({
            college: 'CAT Score Required',
            chance: 0,
            message: 'Please take the CAT exam and enter your score to get accurate predictions.'
        });
    }

    return predictions;
}

// Display Results Function
function displayResults(predictions) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsSection = document.getElementById('results');

    resultsContainer.innerHTML = '';

    if (predictions.length === 0) {
        resultsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <h4>No predictions available yet. Please enter your CAT score!</h4>
                    </div>
                `;
    } else {
        predictions.forEach(pred => {
            let chanceClass = 'call-low';
            let chanceText = 'Low Chance';

            if (pred.chance >= 70) {
                chanceClass = 'call-high';
                chanceText = 'High Chance';
            } else if (pred.chance >= 40) {
                chanceClass = 'call-medium';
                chanceText = 'Moderate Chance';
            }

            const cardHTML = `
                        <div class="col-md-6 col-lg-4">
                            <div class="college-card">
                                <h5><i class="fas fa-university me-2"></i>${pred.college}</h5>
                                <div class="mt-3">
                                    ${pred.message ?
                    `<p class="text-muted">${pred.message}</p>` :
                    `
                                        <span class="call-chance ${chanceClass}">${chanceText}</span>
                                        <p class="mt-3 mb-0"><strong>Predicted Call Chance: ${pred.chance}%</strong></p>
                                        <p class="text-muted mb-0">Based on your CAT percentile: ${pred.percentile}</p>
                                        `
                }
                                </div>
                            </div>
                        </div>
                    `;

            resultsContainer.innerHTML += cardHTML;
        });
    }

    resultsSection.classList.add('show');
}





function handleConsultationFormVisibility() {
    const consultationForm = document.querySelector('.consultation-sticky');
    const formContainer = document.querySelector('.form-container');
    const predictor = document.getElementById('predictor');
    const footer = document.getElementById('footer') || document.querySelector('footer');

    if (!consultationForm || !formContainer || !predictor || !footer) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    const formContainerTop = formContainer.getBoundingClientRect().top + scrollY;
    const formContainerBottom = formContainerTop + formContainer.offsetHeight;
    const footerTop = footer.getBoundingClientRect().top + scrollY;

    const currentScroll = scrollY + windowHeight / 2;

    const isAfterFormContainer = currentScroll > formContainerBottom;
    const isBeforeFooter = scrollY + windowHeight < footerTop + 350;
    const isNotInFormContainer = scrollY > formContainerBottom || (scrollY + windowHeight) < formContainerTop;

    const shouldShow = isAfterFormContainer && isBeforeFooter;

    if (shouldShow) {
        consultationForm.classList.add('visible');
    } else {
        consultationForm.classList.remove('visible');
    }
}

window.addEventListener('scroll', handleConsultationFormVisibility);
window.addEventListener('load', handleConsultationFormVisibility);

// Form submission handler for main form
document.getElementById('predictorForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'block';

    setTimeout(() => {
        spinner.style.display = 'none';
        document.getElementById('results').classList.add('show');
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }, 3000);
});

// Consultation Form Toggle for Mobile
const consultBtn = document.getElementById("consultToggleBtn");
const consultSticky = document.querySelector(".consultation-sticky");

consultBtn?.addEventListener("click", () => {
    consultSticky.classList.toggle("visible");
});

function handleConsultVisibility() {
    if (window.innerWidth <= 768) {
        consultBtn.style.display = "flex";
        consultSticky.classList.remove("visible");
    } else {
        consultBtn.style.display = "none";
    }
}

window.addEventListener("resize", handleConsultVisibility);
handleConsultVisibility();

function handleScrollConsult() {
    if (window.innerWidth <= 768) return;

    const form = document.querySelector(".form-container");
    const footer = document.getElementById("footer");
    if (!form || !footer) return;

    const formBottom = form.offsetTop + form.offsetHeight;
    const footerTop = footer.offsetTop;
    const scroll = window.scrollY + window.innerHeight / 2;

    consultSticky.classList.toggle(
        "visible",
        scroll > formBottom && scroll < footerTop
    );
}

window.addEventListener("scroll", handleScrollConsult);
handleScrollConsult();

// Consultation Form Toggle with Close Button
document.addEventListener("DOMContentLoaded", () => {
    const consultBtn = document.getElementById("consultToggleBtn");
    const consultForm = document.querySelector(".consultation-sticky");
    const closeBtn = consultForm?.querySelector(".close-form");

    if (!consultBtn || !consultForm) return;

    consultBtn.addEventListener("click", () => {
        consultForm.classList.add("visible");
        consultBtn.style.display = "none";
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            consultForm.classList.remove("visible");
            consultBtn.style.display = "flex";
        });
    }
});



// Form submission handler for consultation form
document.getElementById('consultForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const inputs = this.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#ddd';
        }
    });

    if (isValid) {
        alert('Thank you! We will contact you soon.');
        this.reset();
    } else {
        alert('Please fill in all required fields.');
    }
});

// Reset border color on input
document.querySelectorAll('.consultation-sticky .form-control, .consultation-sticky .form-select').forEach(input => {
    input.addEventListener('focus', function () {
        this.style.borderColor = '#52b788';
    });
});

