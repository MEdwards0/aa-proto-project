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

        if (variable == element) {
            result = true;
        };
    });

    return result;
};

const processClaim = req => {

    let error;

    // Check each body input value to ensure they all conform with the standard.
    // ensure they all come back true

    Object.values(req.body).forEach(element => {
        
        // customInputValidation checks the first argument against the rest. The function takes any number of args.
        error = customInputValidation(element, 'Yes', 'No', 'L', 'H', 'N') ? false : true;
    });

    // if customInputValidation returns a false at any point, then error is set to true and causes a return statement with a message.

    if (error) {
        return {
            error: true,
            message: 'Altered data detected. Please try again.',
        };
    };

    // Note: If the input names change in the html file, then this whole function will need to be re-written. This will accrue technical debt.

    // Get all variables from the body object.
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

    // Checking claim logic here:

    // Check if the claim has another benefit already

    if (otherBenefitSubmit == 'Yes') {
        return {
            error: true,
            message: 'The claim has been denied due to already having another benefit.',
        };
    };

    // Check pension age

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

    if (severeDisabilitySubmit == 'No') {
        return {
            error: true,
            message: 'The claim has been denied due to not having a severe disability.'
        };
    };

    // Check 6 months

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

    // If no errors at this point, return no erros and a message of success.

    return {
        error: false,
        message: 'Claim Successful'
    };

};

module.exports = {processClaim};
