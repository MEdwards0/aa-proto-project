
// BUTTONS
const startClaimButton = document.getElementById('start-claim');
const backClaimButton = document.getElementById('back-to-new-claim-button');
const nextOtherBenefitButton = document.getElementById('other-benefit-button');
const backOtherBenefitButton = document.getElementById('back-to-other-benefit-button');
const nextPensionAgeButton = document.getElementById('pension-age-button');
const backPensionAgeButton = document.getElementById('back-pension-age-button');
const nextPhysicalDisabilityButton = document.getElementById('physical-disability-button');
const backPhysicalDisabilityButton = document.getElementById('back-physical-disability-button');
const nextMentalDisabilityButton = document.getElementById('mental-disability-button');
const backMentalDisabilityButton = document.getElementById('back-mental-disability-button');
const nextSevereDisabilityButton = document.getElementById('severe-disability-button');
const backSevereDisabilityButton = document.getElementById('back-severe-disability-button');
const nextSupervisionButton = document.getElementById('supervision-button');
const backSupervisionButton = document.getElementById('back-supervision-button');
const nextSixMonthsButton = document.getElementById('six-months-button');
const backSixMonthsButton = document.getElementById('back-six-months-button');
const nextClaimingWithinGbButton = document.getElementById('claiming-within-gb-button');
const backClaimingWithinGbButton = document.getElementById('back-claiming-within-gb-button');
const nextArmedForcesButton = document.getElementById('armed-forces-button');
const backArmedForcesButton = document.getElementById('back-armed-forces-button');
const nextUkDurationButton = document.getElementById('uk-duration-button');
const backUkDurationButton = document.getElementById('back-uk-duration-button');
const nextRefugeeButton = document.getElementById('refugee-button');
const backRefugeeButton = document.getElementById('back-refugee-button');
const nextHabitualResidentButton = document.getElementById('habitual-resident-button');
const backHabitualResidentButton = document.getElementById('back-habitual-resident-button');
const nextImmigrationControlButton = document.getElementById('immigration-control-button');
const backImmigrationControlButton = document.getElementById('back-immigration-control-button');
const nextSponsoredImmigrantButton = document.getElementById('sponsored-immigrant-button');
const backSponsoredImmigrantButton = document.getElementById('back-sponsored-immigrant-button');
const nextInCareHomeButton = document.getElementById('in-care-home-button');
const backInCareHomeButton = document.getElementById('back-in-care-home-button');
const nextCareHomeCostsButton = document.getElementById('care-home-costs-button');
const backCareHomeCostsButton = document.getElementById('back-care-home-costs-button');
const nextCareLevelButton = document.getElementById('care-level-button');
const backCareLevelButton = document.getElementById('back-care-level-button');
const submitClaimButton = document.getElementById('submit-form-button')

// FORMS

const newClaimRadioDiv = document.getElementById('start-new-claim-radios');
const otherBenefitRadioDiv = document.getElementById('other-benefit-radio-div');
const pensionAgeRadioDiv = document.getElementById('pension-age-radio-div');
const physicalDisabilityRadioDiv = document.getElementById('physical-disability-radio-div');
const mentalDisabilityRadioDiv = document.getElementById('mental-disability-radio-div');
const severeDisabilityRadioDiv = document.getElementById('severe-disability-radio-div');
const supervisionRadioDiv = document.getElementById('supervision-radio-div');
const sixMonthsRadioDiv = document.getElementById('six-months-radio-div');
const claimingWithinGbRadioDiv = document.getElementById('claiming-within-gb-radio-div');
const armedForcesRadioDiv = document.getElementById('armed-forces-radio-div');
const ukDurationRadioDiv = document.getElementById('uk-duration-radio-div');
const refugeeRadioDiv = document.getElementById('refugee-radio-div');
const habitualResidentRadioDiv = document.getElementById('habitual-resident-radio-div');
const immigrationControlRadioDiv = document.getElementById('immigration-control-radio-div');
const sponsoredImmigrantRadioDiv = document.getElementById('sponsored-immigrant-radio-div');
const inCareHomeRadioDiv = document.getElementById('in-care-home-radio-div');
const careHomeCostsRadioDiv = document.getElementById('care-home-costs-radio-div');
const careLevelRadioDiv = document.getElementById('care-level-radio-div');
const inputForm = document.getElementById('input-form');

// helper functions

function showElement(element) {

    if (element.tagName == 'BUTTON') {
        element.style.display = 'inline-block';
        element.parentNode.style.display = 'inline-block';
        return;
    }

    element.style.display = 'block';
}

function hideElement(element) {
    element.style.display = 'none';
}

function hideAllElements() {

    const elements = document.getElementsByClassName('aa-claim');

    for (let i = 0; i < elements.length; i++) {
        hideElement(elements[i]);
    };
}

// main functions


function newClaim() {
    hideAllElements();
    showElement(document.getElementById('start-new-claim-radios'));
    showElement(startClaimButton);
    // showElement(startClaimButton.parentNode);
};

function otherBenefit(flag = false) {
    hideAllElements();

    if (flag === true) {
        showElement(otherBenefitRadioDiv);
        showElement(nextCareLevelButton)
    } else {
        showElement(otherBenefitRadioDiv);
        showElement(backClaimButton);
        showElement(nextOtherBenefitButton);
    };
};

function pensionAge(flag = false) {
    hideAllElements();


    if (flag === true) {
        showElement(pensionAgeRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(pensionAgeRadioDiv);
        showElement(backOtherBenefitButton);
        showElement(nextPensionAgeButton);
    };

};

function physicalDisability(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(physicalDisabilityRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(physicalDisabilityRadioDiv);
        showElement(backPensionAgeButton);
        showElement(nextPhysicalDisabilityButton);
    };

};

function mentalDisability(flag = false) {
    hideAllElements();

    if (flag === true) {
        showElement(mentalDisabilityRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(mentalDisabilityRadioDiv);
        showElement(backPhysicalDisabilityButton);
        showElement(nextMentalDisabilityButton);
    };

};

function severeDisability(flag = false) {
    hideAllElements();
    

    if (flag === true) {
        showElement(severeDisabilityRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(severeDisabilityRadioDiv);
        showElement(backMentalDisabilityButton);
        showElement(nextSevereDisabilityButton);
    };


};

function supervision(flag = false) {
    hideAllElements();
    

    if (flag === true) {
        showElement(supervisionRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(supervisionRadioDiv);
        showElement(backSevereDisabilityButton);
        showElement(nextSupervisionButton);
    };

};

function sixMonths(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(sixMonthsRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(sixMonthsRadioDiv);
        showElement(backSupervisionButton);
        showElement(nextSixMonthsButton);
    };

};

function claimingWithinGb(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(claimingWithinGbRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(claimingWithinGbRadioDiv);
        showElement(backSixMonthsButton);
        showElement(nextClaimingWithinGbButton);
    };
};

function armedForces(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(armedForcesRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(armedForcesRadioDiv);
        showElement(backClaimingWithinGbButton);
        showElement(nextArmedForcesButton);
    };

};

function ukDuration(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(ukDurationRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(ukDurationRadioDiv);
        showElement(backArmedForcesButton);
        showElement(nextUkDurationButton);
    };

};

function refugee(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(refugeeRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(refugeeRadioDiv);
        showElement(backUkDurationButton);
        showElement(nextRefugeeButton);
    };

};

function habitualResident(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(habitualResidentRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(habitualResidentRadioDiv);
        showElement(backRefugeeButton);
        showElement(nextHabitualResidentButton);
    };

};

function immigrationControl(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(immigrationControlRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(immigrationControlRadioDiv);
        showElement(backHabitualResidentButton);
        showElement(nextImmigrationControlButton);
    };

};

function sponsoredImmigrant(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(sponsoredImmigrantRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(sponsoredImmigrantRadioDiv);
        showElement(backImmigrationControlButton);
        showElement(nextSponsoredImmigrantButton);
    };

};

function inCareHome(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(inCareHomeRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(inCareHomeRadioDiv);
        showElement(backSponsoredImmigrantButton);
        showElement(nextInCareHomeButton);
    };

};

function careHomeCosts(flag = false) {
    hideAllElements();
    

    if (flag === true) {
        showElement(careHomeCostsRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(careHomeCostsRadioDiv);
        showElement(backInCareHomeButton);
        showElement(nextCareHomeCostsButton);
    };

};

function careLevel(flag = false) {
    hideAllElements();
    
    if (flag === true) {
        showElement(careLevelRadioDiv);
        showElement(nextCareLevelButton);
    } else {
        showElement(careLevelRadioDiv);
        showElement(backCareHomeCostsButton);
        showElement(nextCareLevelButton);
    };


    // show parent elements

    // showElement(backCareHomeCostsButton.parentNode);
    // showElement(nextCareLevelButton.parentNode);
};

function summary() {
    hideAllElements();
    showElement(inputForm);
    showElement(submitClaimButton);
    showElement(backCareLevelButton);
    document.querySelectorAll('a[class="govuk-link aa-claim"]').forEach(element => {
        element.style.display = 'inline';
    });

    // show parent elements

    // showElement(backCareLevelButton.parentNode);

};

// Forward button functionality

startClaimButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="new-claim"]:checked');
    if (radioOption.value == 'No') {
        const nino = document.getElementById('nino').textContent;
        window.location.href = `/view-customer-data/${nino}`;
        // hideAllElements();
    } else {
        otherBenefit();
    }

    // if (radioOption.value == 'Yes') {
        
    // }
    
});


nextOtherBenefitButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="other-benefit"]:checked');
    document.getElementById('other-benefit-submit').value = radioOption.value;
    pensionAge();
});

nextPensionAgeButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="pension-age"]:checked');
    document.getElementById('pension-age-submit').value = radioOption.value;
    physicalDisability();
});

nextPhysicalDisabilityButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="physical-disability"]:checked');
    document.getElementById('physical-disability-submit').value = radioOption.value;
    mentalDisability();
});

nextMentalDisabilityButton.addEventListener('click', () => {
    const radioOption = document.querySelector(('input[name="mental-disability"]:checked'));
    document.getElementById('mental-disability-submit').value = radioOption.value;
    severeDisability();
});

nextSevereDisabilityButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="severe-disability"]:checked');
    document.getElementById('severe-disability-submit').value = radioOption.value;
    supervision();
});

nextSupervisionButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="supervision"]:checked');
    document.getElementById('supervision-submit').value = radioOption.value;
    sixMonths();
});

nextSixMonthsButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="six-months"]:checked');
    document.getElementById('six-months-submit').value = radioOption.value;
    claimingWithinGb();
});

nextClaimingWithinGbButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="claiming-within-gb"]:checked');
    document.getElementById('claiming-within-gb-submit').value = radioOption.value;
    armedForces();
});

nextArmedForcesButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="armed-forces"]:checked');
    document.getElementById('armed-forces-submit').value = radioOption.value;
    ukDuration();
});

nextUkDurationButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="uk-duration"]:checked');
    document.getElementById('uk-duration-submit').value = radioOption.value;
    refugee();
});

nextRefugeeButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="refugee"]:checked');
    document.getElementById('refugee-submit').value = radioOption.value;
    habitualResident();
});

nextHabitualResidentButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="habitual-resident"]:checked');
    document.getElementById('habitual-resident-submit').value = radioOption.value;
    immigrationControl();
});

nextImmigrationControlButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="immigration-control"]:checked');
    document.getElementById('immigration-control-submit').value = radioOption.value;
    sponsoredImmigrant();
});

nextSponsoredImmigrantButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="sponsored-immigrant"]:checked');
    document.getElementById('sponsored-immigrant-submit').value = radioOption.value;
    inCareHome();
});

nextInCareHomeButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="in-care-home"]:checked');
    document.getElementById('in-care-home-submit').value = radioOption.value;
    careHomeCosts();
});

nextCareHomeCostsButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="care-home-costs"]:checked');
    document.getElementById('care-home-costs-submit').value = radioOption.value;
    careLevel();
});

nextCareLevelButton.addEventListener('click', () => {
    const radioOption = document.querySelector('input[name="care-level"]:checked');
    document.getElementById('care-level-submit').value = radioOption.value;
    updateValues();
    summary();
});

// Back button functionality

backCareHomeCostsButton.addEventListener('click', careHomeCosts);

backCareLevelButton.addEventListener('click', careLevel);

backInCareHomeButton.addEventListener('click', inCareHome);

backSponsoredImmigrantButton.addEventListener('click', sponsoredImmigrant);

backImmigrationControlButton.addEventListener('click', immigrationControl);

backHabitualResidentButton.addEventListener('click', habitualResident);

backRefugeeButton.addEventListener('click', refugee);

backUkDurationButton.addEventListener('click', ukDuration);

backArmedForcesButton.addEventListener('click', armedForces);

backSupervisionButton.addEventListener('click', supervision);

backClaimingWithinGbButton.addEventListener('click', claimingWithinGb);

backSevereDisabilityButton.addEventListener('click', severeDisability);

backMentalDisabilityButton.addEventListener('click', mentalDisability);

backPhysicalDisabilityButton.addEventListener('click', physicalDisability);

backPensionAgeButton.addEventListener('click', pensionAge);

backSixMonthsButton.addEventListener('click', sixMonths);

backOtherBenefitButton.addEventListener('click', otherBenefit);

backClaimButton.addEventListener('click', newClaim);

// Other benefit radio error message

document.querySelectorAll('input[name="other-benefit"]').forEach(element => {
    element.addEventListener('click', () => {

        const radioYes = document.getElementById('other-benefit-yes');
        const radioNo = document.getElementById('other-benefit-no');

        if (document.activeElement === radioYes) {
            showElement(document.getElementById('other-benefit-error'));
        }

        if (document.activeElement === radioNo) {
            hideElement(document.getElementById('other-benefit-error'));
        };
    });
});

// Pension age radio error message

document.querySelectorAll('input[name="pension-age"]').forEach(element => {
    const radioYes = document.getElementById('pension-age-yes');
    const radioNo = document.getElementById('pension-age-no');

    element.addEventListener('click', () => {
        if (document.activeElement === radioYes) {
            hideElement(document.getElementById('pension-age-error'));
        }

        if (document.activeElement === radioNo) {
            showElement(document.getElementById('pension-age-error'));
        };
    });
});

// Mental disability radio error message

document.querySelectorAll('input[name="mental-disability"]').forEach(element => {
    const radioYes = document.getElementById('mental-disability-yes');
    const radioNo = document.getElementById('mental-disability-no');


    element.addEventListener('click', () => {
        const physicalDisabilityAnswer = document.getElementById('physical-disability-submit').value;

        if (document.activeElement === radioYes) {
            hideElement(document.getElementById('mental-disability-error'));
        }

        if (document.activeElement === radioNo && physicalDisabilityAnswer === 'No') {
            showElement(document.getElementById('mental-disability-error'));
        };
    });
});

// Severe disability radio error message

document.querySelectorAll('input[name="severe-disability"]').forEach(element => {
    const radioYes = document.getElementById('severe-disability-yes');
    const radioNo = document.getElementById('severe-disability-no');

    element.addEventListener('click', () => {

        if (document.activeElement === radioYes) {
            hideElement(document.getElementById('severe-disability-error'));
        }

        if (document.activeElement === radioNo) {
            showElement(document.getElementById('severe-disability-error'));
        };
    });
});

// six months radio error message

document.querySelectorAll('input[name="six-months"]').forEach(element => {
    const radioYes = document.getElementById('six-months-yes');
    const radioNo = document.getElementById('six-months-no');

    element.addEventListener('click', () => {
        const supervision = document.getElementById('supervision-submit').value;

        if (document.activeElement === radioYes) {
            hideElement(document.getElementById('six-months-error'));
        }

        if (document.activeElement === radioNo && supervision === 'No') {
            showElement(document.getElementById('six-months-error'));
        };
    });
});

// Armed forces radio error message

document.querySelectorAll('input[name="armed-forces"]').forEach(element => {
    const radioYes = document.getElementById('armed-forces-yes');
    const radioNo = document.getElementById('armed-forces-no');

    element.addEventListener('click', () => {
        const withinGb = document.getElementById('claiming-within-gb-submit').value;

        if (document.activeElement === radioYes) {
            hideElement(document.getElementById('armed-forces-error'));
        }

        if (document.activeElement === radioNo && withinGb === 'No') {
            showElement(document.getElementById('armed-forces-error'));
        };
    });
});

// Refugee radio error message

document.querySelectorAll('input[name="refugee"]').forEach(element => {
    const radioYes = document.getElementById('refugee-yes');
    const radioNo = document.getElementById('refugee-no');

    element.addEventListener('click', () => {
        const ukDuration = document.getElementById('uk-duration-submit').value;

        if (document.activeElement === radioYes) {
            hideElement(document.getElementById('refugee-error'));
        }

        if (document.activeElement === radioNo && ukDuration === 'No') {
            showElement(document.getElementById('refugee-error'));
        };
    });
});

// Habitual resident radio error message

document.querySelectorAll('input[name="habitual-resident"]').forEach(element => {
    const radioYes = document.getElementById('habitual-resident-yes');
    const radioNo = document.getElementById('habitual-resident-no');

    element.addEventListener('click', () => {

        if (document.activeElement === radioYes) {
            hideElement(document.getElementById('habitual-resident-error'));
        }

        if (document.activeElement === radioNo) {
            showElement(document.getElementById('habitual-resident-error'));
        };
    });
});

// Sponsored immigrant radion error message

document.querySelectorAll('input[name="sponsored-immigrant"]').forEach(element => {
    const radioYes = document.getElementById('sponsored-immigrant-yes');
    const radioNo = document.getElementById('sponsored-immigrant-no');

    element.addEventListener('click', () => {
        const immigrationControl = document.getElementById('immigration-control-submit').value;

        if (document.activeElement === radioYes) {
            hideElement(document.getElementById('sponsored-immigrant-error'));
        };

        if (document.activeElement === radioNo && immigrationControl == 'Yes') {
            showElement(document.getElementById('sponsored-immigrant-error'));
        };
    });
});

// Care home costs radio error message

document.querySelectorAll('input[name="care-home-costs"]').forEach(element => {
    const radioYes = document.getElementById('care-home-costs-yes');
    const radioNo = document.getElementById('care-home-costs-no');
    const radioNa = document.getElementById('care-home-costs-na');

    element.addEventListener('click', () => {
        const inCareHome = document.getElementById('in-care-home-submit').value;


        if (document.activeElement === radioYes || document.activeElement == radioNa) {
            hideElement(document.getElementById('care-home-costs-error'));
        };

        if (document.activeElement === radioNo && inCareHome == 'Yes') {
            showElement(document.getElementById('care-home-costs-error'));
        };
    });
});

document.querySelectorAll('a[class="govuk-link aa-claim"]').forEach(element => {
    element.style.cursor = 'pointer';
    element.addEventListener('click', () => {

        switch (element.id) {
            case 'change-other-benefit':
                otherBenefit(true);
                break;
            case 'change-pension-age':
                pensionAge(true);
                break;
            case 'change-physical-disability':
                physicalDisability(true);
                break;
            case 'change-mental-disability':
                mentalDisability(true);
                break;
            case 'change-severe-disability':
                severeDisability(true);
                break;
            case 'change-six-months':
                sixMonths(true);
                break;
            case 'change-claiming-within-gb':
                claimingWithinGb(true);
                break;
            case 'change-armed-forces':
                armedForces(true);
                break;
            case 'change-uk-duration':
                ukDuration(true);
                break;
            case 'change-refugee':
                refugee(true);
                break;
            case 'change-immigration-control':
                immigrationControl(true);
                break;
            case 'change-habitual-resident':
                habitualResident(true);
                break;
            case 'change-sponsored-immigrant':
                sponsoredImmigrant(true);
                break;
            case 'change-in-care-home':
                inCareHome(true);
                break;
            case 'change-care-home-costs':
                careHomeCosts(true);
                break;
            case 'change-care-level':
                careLevel(true);
                break;
            default:
                break;
        };
    });
});

function updateValues() {
    document.getElementById('other-benefit-submit').value = document.querySelector('input[name="other-benefit"]:checked').value;
    document.getElementById('pension-age-submit').value = document.querySelector('input[name="pension-age"]:checked').value;
    document.getElementById('physical-disability-submit').value = document.querySelector('input[name="physical-disability"]:checked').value;
    document.getElementById('mental-disability-submit').value = document.querySelector('input[name="mental-disability"]:checked').value;
    document.getElementById('severe-disability-submit').value = document.querySelector('input[name="severe-disability"]:checked').value;
    document.getElementById('supervision-submit').value = document.querySelector('input[name="supervision"]:checked').value;
    document.getElementById('six-months-submit').value = document.querySelector('input[name="six-months"]:checked').value;
    document.getElementById('claiming-within-gb-submit').value = document.querySelector('input[name="claiming-within-gb"]:checked').value;
    document.getElementById('armed-forces-submit').value = document.querySelector('input[name="armed-forces"]:checked').value;
    document.getElementById('uk-duration-submit').value = document.querySelector('input[name="uk-duration"]:checked').value;
    document.getElementById('refugee-submit').value = document.querySelector('input[name="refugee"]:checked').value;
    document.getElementById('habitual-resident-submit').value = document.querySelector('input[name="habitual-resident"]:checked').value;
    document.getElementById('immigration-control-submit').value = document.querySelector('input[name="immigration-control"]:checked').value;
    document.getElementById('sponsored-immigrant-submit').value = document.querySelector('input[name="sponsored-immigrant"]:checked').value;
    document.getElementById('in-care-home-submit').value = document.querySelector('input[name="in-care-home"]:checked').value;
    document.getElementById('care-home-costs-submit').value = document.querySelector('input[name="care-home-costs"]:checked').value;
    document.getElementById('care-level-submit').value = document.querySelector('input[name="care-level"]:checked').value;

};
