const customInputValidation = (variable, ...inputs) => {

    // Check validation for each input

    if (typeof variable != 'string') {
        return false;
    };

    let result = false;

    inputs.forEach(element => {
        if (typeof element != 'string') {
            return false;
        };

        // if (variable != 'Yes' || variable != 'No') {
        //     return true;
        // };

        if (variable == element) {
            result = true;
        };
    });

    return result;
};

const processClaim = req => {

    let error;

    // convert all values to an array and then check if they are valid.

    Object.values(req.body).forEach(element => {

        // ensure they all come back true
        error = customInputValidation(element, 'Yes', 'No', 'L', 'H', 'N') ? false : true;
    });

    if (error) {
        return {
            error: true,
            message: 'Altered data detected. Please try again.',
        };
    };

    // If the input names change in the html file, then this whole function will need to be re-written. This will accrue technical debt.

    const {
        otherBenefitSubmit,
        pensionAgeSubmit,
        physicalDisabilitySubmit,
        mentalDisabilitySubmit,
        severeDisabilitySubmit,
        supervisionSubmit,
        sixMonthsSubmit,
        claimingWithinGbSubmit,
        armedForcesSubmit,
        ukDurationSubmit,
        refugeeSubmit,
        habitualResidentSubmit,
        immigrationControlSubmit,
        sponsoredImmigrantSubmit,
        inCareHomeSubmit,
        careHomeCostsSubmit
    } = req.body;

    // Check if the claim has another benefit already
    // error = otherBenefitSubmit == 'Yes' ? true : false;

    if (otherBenefitSubmit == 'Yes') {
        return {
            error: true,
            message: 'The claim has been denied due to already having another benefit.',
        };
    };

    // Check pension age
    // error = pensionAgeSubmit == 'No' ? true : false;

    if (pensionAgeSubmit == 'No') {
        return {
            error: true,
            message: 'The claim has been denied due to not being state pension age.'
        };
    };

    // Check physical disability and mental disability

    if (physicalDisabilitySubmit == 'No' && mentalDisabilitySubmit == 'No') {
        return {
            error: true,
            message: 'The claim has been denied due to not having a disability.'
        };
    };

    // Check severe disability
    // error = severeDisabilitySubmit == 'No' ? true : false;
    if (severeDisabilitySubmit == 'No') {
        return {
            error: true,
            message: 'The claim has been denied due to not having a severe disability.'
        };
    };

    // Check supervision
    // error = supervisionSubmit == 'No' ? true : false;
    // if (supervisionSubmit == 'No') {
    //     return {
    //         error: true,
    //         message: 'The claim has been denied due to not needing supervision.'
    //     };
    // };

    // Check 6 months
    // error = sixMonthsSubmit == 'No' && supervisionSubmit == 'No' ? true : false;
    if (sixMonthsSubmit == 'No' && supervisionSubmit == 'No') {
        return {
            error: true,
            message: 'Claim has been denied due to not needing supervision.'
        };
    };

    // Check if the claim is within the UK, if not check if related to armed forces or not.

    if (claimingWithinGbSubmit == 'No' && armedForcesSubmit == 'No') {
        return {
            error: true,
            message: 'Claim has been denied due to not claiming within the UK and no relation to the armed forces.'
        };
    };

    // Check refugee status

    if (ukDurationSubmit == 'No' && refugeeSubmit == 'No') {
        return {
            error: true,
            message: 'Claim has been denied due to not being in the UK for the last 2 of 3 years, and not being a refugee.'
        };
    }

    // Check habitual resident status

    if (habitualResidentSubmit == 'No') {
        return {
            error: true,
            message: 'Claim has been denied due to not being a habitual resident.'
        };
    };

    // Check sponsored immigrant status

    if (sponsoredImmigrantSubmit == 'No' && immigrationControlSubmit == 'Yes') {
        return {
            error: true,
            message: 'Claim has been denied due to being subject to immigration control, without sponsorship.'
        };
    };

    // Check care home status and care home costs

    if (inCareHomeSubmit == 'Yes' && careHomeCostsSubmit == 'No') {
        return {
            error: true,
            message: 'Claim has been denied due to being in a care home, without paying care home costs.'
        };
    };

    return {
        error: false,
        message: 'Claim Successful'
    };

};

module.exports = {processClaim};
