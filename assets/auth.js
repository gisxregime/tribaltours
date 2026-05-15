(function () {
    var AUTH_STORAGE_KEY = 'tribaltours_auth_onboarding_v2';
    var SIGNIN_STORAGE_KEY = 'tribaltours_signin_state_v1';
    var ROLE_KEY = 'role';
    var MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
    var OTP_LENGTH = 6;
    var OTP_EXPIRY_MS = 5 * 60 * 1000;
    var OTP_RESEND_MS = 30 * 1000;
    var OTP_RATE_LIMIT_MS = 10 * 60 * 1000;
    var OTP_RATE_LIMIT_THRESHOLD = 5;
    var FAKE_OTP_CODE = '145985';

    var COUNTRIES = [
        'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
        'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
        'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
        'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
        'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
        'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
        'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
        'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
        'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
        'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
        'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
        'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
        'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
        'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
        'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
        'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
        'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
        'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
        'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
        'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
    ];

    var PHONE_COUNTRIES = [
        { code: '+1', name: 'United States / Canada', min: 10, max: 10 },
        { code: '+7', name: 'Russia', min: 10, max: 10 },
        { code: '+20', name: 'Egypt', min: 10, max: 10 },
        { code: '+27', name: 'South Africa', min: 9, max: 9 },
        { code: '+30', name: 'Greece', min: 10, max: 10 },
        { code: '+31', name: 'Netherlands', min: 9, max: 9 },
        { code: '+32', name: 'Belgium', min: 8, max: 9 },
        { code: '+33', name: 'France', min: 9, max: 9 },
        { code: '+34', name: 'Spain', min: 9, max: 9 },
        { code: '+39', name: 'Italy', min: 9, max: 10 },
        { code: '+41', name: 'Switzerland', min: 9, max: 9 },
        { code: '+44', name: 'United Kingdom', min: 10, max: 10 },
        { code: '+49', name: 'Germany', min: 10, max: 11 },
        { code: '+52', name: 'Mexico', min: 10, max: 10 },
        { code: '+55', name: 'Brazil', min: 10, max: 11 },
        { code: '+60', name: 'Malaysia', min: 9, max: 10 },
        { code: '+61', name: 'Australia', min: 9, max: 9 },
        { code: '+62', name: 'Indonesia', min: 9, max: 12 },
        { code: '+63', name: 'Philippines', min: 10, max: 10 },
        { code: '+64', name: 'New Zealand', min: 8, max: 10 },
        { code: '+65', name: 'Singapore', min: 8, max: 8 },
        { code: '+66', name: 'Thailand', min: 9, max: 9 },
        { code: '+81', name: 'Japan', min: 10, max: 10 },
        { code: '+82', name: 'South Korea', min: 9, max: 10 },
        { code: '+84', name: 'Vietnam', min: 9, max: 10 },
        { code: '+86', name: 'China', min: 11, max: 11 },
        { code: '+91', name: 'India', min: 10, max: 10 },
        { code: '+92', name: 'Pakistan', min: 10, max: 10 },
        { code: '+93', name: 'Afghanistan', min: 9, max: 9 },
        { code: '+94', name: 'Sri Lanka', min: 9, max: 9 },
        { code: '+95', name: 'Myanmar', min: 8, max: 11 },
        { code: '+98', name: 'Iran', min: 10, max: 10 },
        { code: '+212', name: 'Morocco', min: 9, max: 9 },
        { code: '+216', name: 'Tunisia', min: 8, max: 8 },
        { code: '+233', name: 'Ghana', min: 9, max: 9 },
        { code: '+234', name: 'Nigeria', min: 10, max: 10 },
        { code: '+251', name: 'Ethiopia', min: 9, max: 9 },
        { code: '+254', name: 'Kenya', min: 9, max: 9 },
        { code: '+255', name: 'Tanzania', min: 9, max: 9 },
        { code: '+263', name: 'Zimbabwe', min: 9, max: 9 },
        { code: '+966', name: 'Saudi Arabia', min: 9, max: 9 },
        { code: '+971', name: 'United Arab Emirates', min: 9, max: 9 }
    ];

    var ID_TYPES = {
        tourist: ['Passport', 'National ID', 'Driver\'s License', 'UMID', 'PRC ID', 'Postal ID', 'PhilSys ID', 'Voter\'s ID'],
        guide: ['Passport', 'Driver\'s License', 'National ID', 'PRC ID', 'UMID', 'Postal ID', 'PhilSys ID']
    };

    var ID_TYPES_WITH_OPTIONAL_BACK = {
        Passport: true,
        'PhilSys ID': true
    };

    var TOUR_CATEGORIES = ['Hiking', 'Historical', 'Island Hopping', 'Food Tours', 'Cultural Tours', 'Adventure Tours'];

    var REGISTER_STEP_META = {
        email_verification: { label: 'Email', title: 'Start with your email' },
        otp_verification: { label: 'OTP', title: 'Enter your OTP code' },
        role_selection: { label: 'Role', title: 'Choose account role' },
        personal_information: { label: 'Personal', title: 'Personal information' },
        identity_verification: { label: 'Identity', title: 'Identity verification' },
        professional_verification: { label: 'Professional', title: 'Professional verification' },
        security_setup: { label: 'Security', title: 'Secure your account' },
        terms_consent: { label: 'Consent', title: 'Terms and consent' },
        review_confirmation: { label: 'Review', title: 'Review and confirm' }
    };

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function parseJSON(value, fallback) {
        try {
            return JSON.parse(value);
        } catch (_error) {
            return fallback;
        }
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function pad(value) {
        return value < 10 ? '0' + value : String(value);
    }

    function now() {
        return Date.now();
    }

    function formatDateISO(value) {
        if (!value) {
            return '';
        }
        var parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return '';
        }
        return parsed.getFullYear() + '-' + pad(parsed.getMonth() + 1) + '-' + pad(parsed.getDate());
    }

    function yearsOld(birthDate) {
        if (!birthDate) {
            return '';
        }
        var d = new Date(birthDate);
        if (Number.isNaN(d.getTime())) {
            return '';
        }
        var today = new Date();
        var age = today.getFullYear() - d.getFullYear();
        var m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
            age -= 1;
        }
        return age;
    }

    function emailIsValid(value) {
        if (!value) {
            return false;
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
    }

    function cleanDigits(value) {
        return String(value || '').replace(/\D+/g, '');
    }

    function getPhoneMeta(code) {
        var found = PHONE_COUNTRIES.find(function (item) {
            return item.code === code;
        });
        return found || { code: code || '+63', name: 'Custom', min: 8, max: 12 };
    }

    function formatPhoneDigits(value) {
        var digits = cleanDigits(value).slice(0, 12);
        if (digits.length <= 3) {
            return digits;
        }
        if (digits.length <= 6) {
            return digits.slice(0, 3) + ' ' + digits.slice(3);
        }
        if (digits.length <= 10) {
            return digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);
        }
        return digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 10) + ' ' + digits.slice(10);
    }

    function hasUpper(value) {
        return /[A-Z]/.test(value || '');
    }

    function hasLower(value) {
        return /[a-z]/.test(value || '');
    }

    function hasNumber(value) {
        return /\d/.test(value || '');
    }

    function hasSpecial(value) {
        return /[^A-Za-z0-9]/.test(value || '');
    }

    function evaluatePassword(password) {
        var rules = {
            min8: (password || '').length >= 8,
            upper: hasUpper(password),
            lower: hasLower(password),
            number: hasNumber(password),
            special: hasSpecial(password)
        };
        var score = Object.keys(rules).reduce(function (total, key) {
            return total + (rules[key] ? 1 : 0);
        }, 0);
        return {
            score: score,
            rules: rules,
            isStrong: score === 5
        };
    }

    function createInitialRegisterState() {
        return {
            role: '',
            progress: {
                current_step: 'email_verification',
                completed_steps: {}
            },
            auth: {
                email: '',
                otp_requested: false,
                otp_verified: false,
                otp_requested_at: null,
                otp_expires_at: null,
                otp_resend_available_at: null,
                otp_rate_limit_until: null,
                otp_send_attempts: 0,
                otp_last_code: '',
                otp_input: ''
            },
            personal: {
                first_name: '',
                middle_name: '',
                last_name: '',
                suffix: '',
                gender: '',
                birth_date: '',
                age: '',
                nationality: '',
                mobile_country_code: '+63',
                mobile_number_local: '',
                mobile_number_e164: '',
                email_address: '',
                current_address: '',
                city: '',
                province_state: '',
                country: 'Philippines'
            },
            identity: {
                government_id_type: '',
                government_id_front: null,
                government_id_back: null
            },
            professional: {
                nbi_clearance: null,
                nbi_expiration_date: '',
                barangay_clearance: null,
                barangay_issued_date: '',
                guide_certificate_number: '',
                guide_certificate_upload: null,
                tourism_accreditation_upload: null,
                years_of_experience: '',
                languages_spoken: '',
                areas_of_expertise: '',
                tour_categories: []
            },
            security: {
                password: '',
                confirm_password: ''
            },
            agreements: {
                terms_accepted: false,
                privacy_accepted: false,
                info_accuracy_confirmed: false,
                verification_consent: false,
                commission_policy_accepted: false,
                safety_guidelines_accepted: false
            },
            ui: {
                nationality_query: '',
                errors: {},
                touched: {},
                is_submitted: false,
                success_state: false
            },
            created_at: new Date().toISOString()
        };
    }

    function createInitialSignInState() {
        return {
            role: 'tourist',
            view: 'login',
            email: '',
            password: '',
            remember: false,
            forgot_email: '',
            otp_notice: ''
        };
    }

    function getPath(obj, path) {
        if (!path) {
            return undefined;
        }
        return path.split('.').reduce(function (acc, key) {
            return acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined;
        }, obj);
    }

    function setPath(obj, path, value) {
        var keys = path.split('.');
        var target = obj;
        for (var i = 0; i < keys.length - 1; i += 1) {
            var key = keys[i];
            if (typeof target[key] !== 'object' || target[key] === null) {
                target[key] = {};
            }
            target = target[key];
        }
        target[keys[keys.length - 1]] = value;
    }

    function mergeState(defaultState, loadedState) {
        var merged = deepClone(defaultState);
        function merge(target, source) {
            Object.keys(source || {}).forEach(function (key) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
                        target[key] = {};
                    }
                    merge(target[key], source[key]);
                    return;
                }
                target[key] = source[key];
            });
        }
        merge(merged, loadedState || {});
        return merged;
    }

    function getAuthStepsForRole(role) {
        var steps = [
            'email_verification',
            'otp_verification',
            'role_selection',
            'personal_information'
        ];
        steps.push('security_setup');
        steps.push('terms_consent');
        steps.push('review_confirmation');
        return steps;
    }

    function createFileRecord(file) {
        return {
            id: 'f_' + String(now()) + '_' + Math.floor(Math.random() * 9999),
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            progress: 0,
            status: 'uploading',
            uploaded_at: null,
            failed_message: ''
        };
    }

    function AuthController(root) {
        this.root = root;
        this.mode = root.dataset.authContext || 'register';
        this.state = null;
        this.uploadTimers = {};
        this.otpTicker = null;
        this.countrySearchTicker = null;
        this.modalOpen = false;
    }

    AuthController.prototype.init = function () {
        if (this.mode === 'signin') {
            this.loadSignInState();
            this.renderSignIn();
            return;
        }
        this.loadRegisterState();
        this.renderRegister();
        this.startOtpTicker();
    };

    AuthController.prototype.loadRegisterState = function () {
        var loaded = parseJSON(localStorage.getItem(AUTH_STORAGE_KEY), null);
        var base = createInitialRegisterState();
        this.state = mergeState(base, loaded);
        this.state.personal.email_address = this.state.auth.email || this.state.personal.email_address;
        if (!this.state.progress.current_step) {
            this.state.progress.current_step = 'email_verification';
        }
    };

    AuthController.prototype.saveRegisterState = function () {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.state));
    };

    AuthController.prototype.loadSignInState = function () {
        var loaded = parseJSON(localStorage.getItem(SIGNIN_STORAGE_KEY), null);
        this.signInState = mergeState(createInitialSignInState(), loaded || {});
    };

    AuthController.prototype.saveSignInState = function () {
        localStorage.setItem(SIGNIN_STORAGE_KEY, JSON.stringify(this.signInState));
    };

    AuthController.prototype.getSteps = function () {
        return getAuthStepsForRole(this.state.role);
    };

    AuthController.prototype.currentStep = function () {
        var steps = this.getSteps();
        if (steps.indexOf(this.state.progress.current_step) === -1) {
            this.state.progress.current_step = steps[0];
        }
        return this.state.progress.current_step;
    };

    AuthController.prototype.setCurrentStep = function (stepId) {
        if (this.getSteps().indexOf(stepId) === -1) {
            return;
        }
        this.state.progress.current_step = stepId;
        this.state.ui.errors = {};
        this.saveRegisterState();
        this.renderRegister();
    };

    AuthController.prototype.markStepComplete = function (stepId) {
        this.state.progress.completed_steps[stepId] = true;
    };

    AuthController.prototype.clearStepComplete = function (stepId) {
        delete this.state.progress.completed_steps[stepId];
    };

    AuthController.prototype.markTouched = function (path) {
        this.state.ui.touched[path] = true;
    };

    AuthController.prototype.getError = function (path) {
        return this.state.ui.errors[path] || '';
    };

    AuthController.prototype.fieldClass = function (path) {
        var touched = !!this.state.ui.touched[path] || this.state.ui.is_submitted;
        var hasError = !!this.state.ui.errors[path];
        if (!touched) {
            return '';
        }
        return hasError ? 'is-invalid' : 'is-valid';
    };

    AuthController.prototype.inlineError = function (path) {
        return esc(this.getError(path));
    };

    AuthController.prototype.validateCurrentStep = function () {
        var step = this.currentStep();
        var errors = {};
        var st = this.state;

        function addError(path, message) {
            errors[path] = message;
        }

        if (step === 'email_verification') {
            if (!emailIsValid(st.auth.email)) {
                addError('auth.email', 'Enter a valid email address.');
            }
        }

        if (step === 'otp_verification') {
            if (!st.auth.otp_requested) {
                addError('auth.otp_input', 'Send a verification code first.');
            }
            if (!/^\d{6}$/.test(st.auth.otp_input || '')) {
                addError('auth.otp_input', 'Enter the 6-digit code.');
            }
            if (st.auth.otp_expires_at && now() > st.auth.otp_expires_at) {
                addError('auth.otp_input', 'OTP has expired. Request a new code.');
            }
            if (!st.auth.otp_verified && st.auth.otp_input && st.auth.otp_input.length === 6 && st.auth.otp_last_code && st.auth.otp_input !== st.auth.otp_last_code) {
                addError('auth.otp_input', 'Invalid OTP. Please try again.');
            }
        }

        if (step === 'role_selection') {
            if (!st.role) {
                addError('role', 'Select Tourist or Tour Guide to continue.');
            }
        }

        if (step === 'personal_information') {
            if (!st.personal.first_name.trim()) {
                addError('personal.first_name', 'First name is required.');
            }
            if (!st.personal.last_name.trim()) {
                addError('personal.last_name', 'Last name is required.');
            }
            if (!st.personal.gender) {
                addError('personal.gender', 'Select a gender option.');
            }
            if (!st.personal.birth_date) {
                addError('personal.birth_date', 'Date of birth is required.');
            }
            var ageValue = Number(st.personal.age || 0);
            var minAge = st.role === 'guide' ? 21 : 18;
            if (!Number.isFinite(ageValue) || ageValue < minAge) {
                addError('personal.age', (st.role === 'guide' ? 'Tour Guide' : 'Tourist') + ' minimum age is ' + minAge + '.');
            }
            if (!st.personal.nationality) {
                addError('personal.nationality', 'Select citizenship or nationality.');
            }
            var phoneMeta = getPhoneMeta(st.personal.mobile_country_code);
            var phoneDigits = cleanDigits(st.personal.mobile_number_local);
            if (!st.personal.mobile_country_code) {
                addError('personal.mobile_country_code', 'Country code is required.');
            }
            if (!phoneDigits) {
                addError('personal.mobile_number_local', 'Mobile number is required.');
            } else if (phoneDigits.length < phoneMeta.min || phoneDigits.length > phoneMeta.max) {
                addError('personal.mobile_number_local', 'Mobile number length is invalid for selected country code.');
            }
            if (!st.personal.current_address.trim()) {
                addError('personal.current_address', 'Current address is required.');
            }
            if (!st.personal.city.trim()) {
                addError('personal.city', 'City is required.');
            }
            if (!st.personal.country.trim()) {
                addError('personal.country', 'Country is required.');
            }
            if (st.role === 'guide' && !st.personal.province_state.trim()) {
                addError('personal.province_state', 'Province or state is required for guide onboarding.');
            }
            if (st.role === 'guide' && !emailIsValid(st.personal.email_address || st.auth.email)) {
                addError('personal.email_address', 'A valid email address is required.');
            }
        }

        if (step === 'identity_verification') {
            if (!st.identity.government_id_type) {
                addError('identity.government_id_type', 'Select government ID type.');
            }
            if (!st.identity.government_id_front) {
                addError('identity.government_id_front', 'Upload front image or document.');
            } else if (st.identity.government_id_front.status !== 'uploaded') {
                addError('identity.government_id_front', 'Front upload must finish successfully.');
            }
            var backOptional = !!ID_TYPES_WITH_OPTIONAL_BACK[st.identity.government_id_type];
            if (!backOptional) {
                if (!st.identity.government_id_back) {
                    addError('identity.government_id_back', 'Upload back image for selected ID type.');
                } else if (st.identity.government_id_back.status !== 'uploaded') {
                    addError('identity.government_id_back', 'Back upload must finish successfully.');
                }
            }
        }

        if (step === 'professional_verification') {
            if (st.role === 'guide') {
                if (!st.professional.nbi_clearance) {
                    addError('professional.nbi_clearance', 'NBI clearance upload is required.');
                } else if (st.professional.nbi_clearance.status !== 'uploaded') {
                    addError('professional.nbi_clearance', 'NBI upload must finish successfully.');
                }
                if (!st.professional.nbi_expiration_date) {
                    addError('professional.nbi_expiration_date', 'Enter NBI clearance expiration date.');
                }
                if (!st.professional.barangay_clearance) {
                    addError('professional.barangay_clearance', 'Barangay clearance upload is required.');
                } else if (st.professional.barangay_clearance.status !== 'uploaded') {
                    addError('professional.barangay_clearance', 'Barangay upload must finish successfully.');
                }
                if (!st.professional.barangay_issued_date) {
                    addError('professional.barangay_issued_date', 'Enter barangay issued date.');
                }
            }
        }

        if (step === 'security_setup') {
            var result = evaluatePassword(st.security.password || '');
            if (!result.isStrong) {
                addError('security.password', 'Password does not meet security requirements.');
            }
            if (!st.security.confirm_password) {
                addError('security.confirm_password', 'Confirm your password.');
            } else if (st.security.password !== st.security.confirm_password) {
                addError('security.confirm_password', 'Passwords do not match.');
            }
        }

        if (step === 'terms_consent') {
            if (!st.agreements.terms_accepted) {
                addError('agreements.terms_accepted', 'Terms and Conditions consent is required.');
            }
            if (!st.agreements.privacy_accepted) {
                addError('agreements.privacy_accepted', 'Privacy Policy consent is required.');
            }
            if (!st.agreements.info_accuracy_confirmed) {
                addError('agreements.info_accuracy_confirmed', 'Please confirm information accuracy.');
            }
            if (!st.agreements.verification_consent) {
                addError('agreements.verification_consent', 'Identity verification consent is required.');
            }
            if (st.role === 'guide' && !st.agreements.commission_policy_accepted) {
                addError('agreements.commission_policy_accepted', 'Guide commission policy agreement is required.');
            }
            if (st.role === 'guide' && !st.agreements.safety_guidelines_accepted) {
                addError('agreements.safety_guidelines_accepted', 'Community safety guidelines agreement is required.');
            }
        }

        this.state.ui.errors = errors;
        return Object.keys(errors).length === 0;
    };

    AuthController.prototype.nextStep = function () {
        var steps = this.getSteps();
        var index = steps.indexOf(this.currentStep());
        if (index < 0 || index === steps.length - 1) {
            return;
        }
        this.setCurrentStep(steps[index + 1]);
    };

    AuthController.prototype.prevStep = function () {
        var steps = this.getSteps();
        var index = steps.indexOf(this.currentStep());
        if (index <= 0) {
            return;
        }
        this.setCurrentStep(steps[index - 1]);
    };

    AuthController.prototype.sendOtpCode = function () {
        if (!emailIsValid(this.state.auth.email)) {
            this.state.ui.errors = { 'auth.email': 'Enter a valid email address before requesting OTP.' };
            this.state.ui.touched['auth.email'] = true;
            this.renderRegister();
            return;
        }

        var rightNow = now();
        if (this.state.auth.otp_rate_limit_until && rightNow < this.state.auth.otp_rate_limit_until) {
            this.flashAlert('Too many OTP requests. Please wait for the cooldown to finish.', 'error');
            return;
        }

        this.state.auth.otp_send_attempts += 1;
        if (this.state.auth.otp_send_attempts >= OTP_RATE_LIMIT_THRESHOLD) {
            this.state.auth.otp_rate_limit_until = rightNow + OTP_RATE_LIMIT_MS;
            this.state.auth.otp_send_attempts = 0;
        }

        this.state.auth.otp_requested = true;
        this.state.auth.otp_verified = false;
        this.state.auth.otp_requested_at = rightNow;
        this.state.auth.otp_expires_at = rightNow + OTP_EXPIRY_MS;
        this.state.auth.otp_resend_available_at = rightNow + OTP_RESEND_MS;
        this.state.auth.otp_last_code = FAKE_OTP_CODE;
        this.state.auth.otp_input = '';
        this.state.personal.email_address = this.state.auth.email;

        this.markStepComplete('email_verification');
        this.saveRegisterState();
        this.flashAlert('Verification code sent. Demo OTP: ' + this.state.auth.otp_last_code + '.', 'success');
        this.setCurrentStep('otp_verification');
    };

    AuthController.prototype.verifyOtp = function () {
        this.state.ui.touched['auth.otp_input'] = true;
        var valid = this.validateCurrentStep();
        if (!valid) {
            this.renderRegister();
            return;
        }
        if (this.state.auth.otp_input !== this.state.auth.otp_last_code) {
            this.state.ui.errors = { 'auth.otp_input': 'Invalid OTP. Please try again.' };
            this.renderRegister();
            return;
        }

        this.state.auth.otp_verified = true;
        this.markStepComplete('otp_verification');
        this.flashAlert('Email verified successfully.', 'success');
        this.saveRegisterState();
        this.setCurrentStep('role_selection');
    };

    AuthController.prototype.resendOtp = function () {
        if (!this.state.auth.otp_requested) {
            return;
        }
        var rightNow = now();
        if (this.state.auth.otp_resend_available_at && rightNow < this.state.auth.otp_resend_available_at) {
            return;
        }
        this.sendOtpCode();
    };

    AuthController.prototype.persistThenRender = function () {
        if (this.mode === 'signin') {
            this.saveSignInState();
            this.renderSignIn();
            return;
        }
        this.saveRegisterState();
        this.renderRegister();
    };

    AuthController.prototype.handlePrimaryAction = function () {
        var step = this.currentStep();
        this.state.ui.is_submitted = true;

        if (step === 'email_verification') {
            this.sendOtpCode();
            return;
        }

        if (step === 'otp_verification') {
            this.verifyOtp();
            return;
        }

        if (step === 'review_confirmation') {
            this.redirectToGuideDashboard();
            return;
        }

        var valid = this.validateCurrentStep();
        if (!valid) {
            this.renderRegister();
            return;
        }

        this.markStepComplete(step);
        if (step === 'role_selection') {
            if (this.state.role !== 'guide') {
                this.clearStepComplete('professional_verification');
            }
        }
        this.saveRegisterState();
        this.nextStep();
    };

    AuthController.prototype.redirectToGuideDashboard = function () {
        localStorage.setItem(ROLE_KEY, 'guide');
        this.markStepComplete('review_confirmation');
        this.saveRegisterState();
        window.location.href = 'pages/dashboard.html';
    };

    AuthController.prototype.startOtpTicker = function () {
        var self = this;
        if (this.otpTicker) {
            clearInterval(this.otpTicker);
        }
        this.otpTicker = setInterval(function () {
            if (self.mode !== 'register') {
                return;
            }
            var step = self.currentStep();
            if (step !== 'otp_verification' && step !== 'email_verification') {
                return;
            }
            var otpCountdown = qs('[data-otp-countdown]', self.root);
            var resendCountdown = qs('[data-resend-countdown]', self.root);
            var resendButton = qs('[data-action="resend-otp"]', self.root);

            if (otpCountdown) {
                var expires = self.state.auth.otp_expires_at || 0;
                var remainOtp = Math.max(0, expires - now());
                otpCountdown.textContent = remainOtp ? self.msToClock(remainOtp) : 'Expired';
            }

            if (resendCountdown) {
                var resendAt = self.state.auth.otp_resend_available_at || 0;
                var remainResend = Math.max(0, resendAt - now());
                resendCountdown.textContent = remainResend ? self.msToClock(remainResend) : 'Ready';
                if (resendButton) {
                    resendButton.disabled = remainResend > 0;
                }
            }

            var rateNotice = qs('[data-rate-limit-countdown]', self.root);
            if (rateNotice) {
                var lockUntil = self.state.auth.otp_rate_limit_until || 0;
                var remainLock = Math.max(0, lockUntil - now());
                rateNotice.textContent = remainLock ? self.msToClock(remainLock) : 'None';
            }
        }, 500);
    };

    AuthController.prototype.msToClock = function (milliseconds) {
        var seconds = Math.ceil(milliseconds / 1000);
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return mins + ':' + pad(secs);
    };

    AuthController.prototype.flashAlert = function (message, type) {
        this.state.ui.flash = {
            message: message,
            type: type || 'info',
            at: now()
        };
    };

    AuthController.prototype.consumeAlert = function () {
        var flash = this.state.ui.flash;
        if (!flash || !flash.message) {
            return '';
        }
        var html = '<div class="auth-alert ' + esc(flash.type || 'info') + '">' + esc(flash.message) + '</div>';
        if (now() - (flash.at || 0) > 10000) {
            delete this.state.ui.flash;
        }
        return html;
    };

    AuthController.prototype.openSubmitModal = function () {
        this.state.ui.is_submitted = true;
        var valid = this.validateCurrentStep();
        if (!valid) {
            this.renderRegister();
            return;
        }
        this.modalOpen = true;
        this.renderRegister();
    };

    AuthController.prototype.confirmSubmit = function () {
        this.modalOpen = false;
        this.state.ui.success_state = true;
        this.markStepComplete('review_confirmation');
        this.saveRegisterState();
        this.renderRegister();
    };

    AuthController.prototype.resetFlow = function () {
        Object.keys(this.uploadTimers).forEach(function (key) {
            clearInterval(this.uploadTimers[key]);
        }, this);
        this.uploadTimers = {};
        this.state = createInitialRegisterState();
        this.saveRegisterState();
        this.renderRegister();
    };

    AuthController.prototype.updateDerivedValues = function () {
        this.state.personal.age = yearsOld(this.state.personal.birth_date);
        this.state.personal.mobile_number_e164 = this.state.personal.mobile_country_code + cleanDigits(this.state.personal.mobile_number_local);
        if (!this.state.personal.email_address) {
            this.state.personal.email_address = this.state.auth.email;
        }
    };

    AuthController.prototype.uploadFieldMarkup = function (path, title, hint) {
        var file = getPath(this.state, path);
        var fieldClass = this.fieldClass(path);
        var hasError = this.inlineError(path);

        var card = '';
        if (file) {
            card = [
                '<div class="auth-upload-card" data-upload-card="' + esc(path) + '">',
                '<div class="auth-upload-head">',
                '<strong>' + esc(file.name) + '</strong>',
                '<span class="auth-progress-badge">' + esc(file.status) + '</span>',
                '</div>',
                '<div class="auth-upload-meta">' + Math.round((file.size || 0) / 1024) + ' KB • ' + esc(file.type || '') + '</div>',
                '<div class="auth-upload-bar"><span style="width:' + Number(file.progress || 0) + '%"></span></div>',
                file.failed_message ? '<div class="auth-error" style="display:block">' + esc(file.failed_message) + '</div>' : '',
                '<div class="auth-upload-actions">',
                file.status === 'failed' ? '<button type="button" class="auth-upload-action" data-action="retry-upload" data-upload-path="' + esc(path) + '">Retry</button>' : '',
                '<button type="button" class="auth-upload-action" data-action="remove-upload" data-upload-path="' + esc(path) + '">Remove</button>',
                '</div>',
                '</div>'
            ].join('');
        }

        return [
            '<div class="auth-field full ' + esc(fieldClass) + '">',
            '<label>' + esc(title) + ' <span class="auth-required">*</span></label>',
            '<div class="auth-upload-dropzone" tabindex="0" role="button" aria-label="Upload ' + esc(title) + '" data-upload-path="' + esc(path) + '">',
            '<div class="auth-upload-inner">',
            '<strong>Drag and drop or click to upload</strong>',
            '<span>' + esc(hint) + '</span>',
            '</div>',
            '<input type="file" class="auth-hidden" data-file-input="' + esc(path) + '" accept=".jpg,.jpeg,.png,.pdf">',
            '</div>',
            card,
            '<small class="auth-error">' + hasError + '</small>',
            '</div>'
        ].join('');
    };

    AuthController.prototype.renderRegister = function () {
        this.updateDerivedValues();
        var steps = this.getSteps();
        var currentStep = this.currentStep();
        var currentIndex = steps.indexOf(currentStep);
        var stepMeta = REGISTER_STEP_META[currentStep] || { label: 'Step', title: 'Onboarding' };
        var panel = this.root.closest('.auth-panel');
        if (panel) {
            var centerLayout = currentStep === 'email_verification' || currentStep === 'otp_verification' || currentStep === 'role_selection' || currentStep === 'review_confirmation';
            panel.classList.toggle('is-centered-layout', centerLayout);
        }

        var stepper = steps.map(function (id, idx) {
            var completed = !!this.state.progress.completed_steps[id];
            var active = id === currentStep;
            var cls = 'auth-step' + (completed ? ' is-complete' : '') + (active ? ' is-active' : '');
            var indexLabel = completed ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : String(idx + 1);
            return '<button type="button" class="' + cls + '" data-step-jump="' + esc(id) + '" aria-current="' + (active ? 'step' : 'false') + '"><span class="auth-step-index">' + indexLabel + '</span><span>' + esc((REGISTER_STEP_META[id] || {}).label || 'Step') + '</span></button>';
        }, this).join('');

        var bodyMarkup = this.renderRegisterStep(currentStep);

        var footerLeft = currentIndex > 0
            ? '<button type="button" class="auth-btn-ghost" data-action="prev-step">Previous</button>'
            : '<span></span>';

        var primaryLabel = 'Continue';
        if (currentStep === 'email_verification') {
            primaryLabel = 'Send Verification Code';
        }
        if (currentStep === 'otp_verification') {
            primaryLabel = 'Verify OTP';
        }
        if (currentStep === 'review_confirmation') {
            primaryLabel = 'Done';
        }

        var primaryDisabled = false;
        if (currentStep === 'terms_consent') {
            var guideNeeds = this.state.role === 'guide';
            var canSubmitTerms = this.state.agreements.terms_accepted && this.state.agreements.privacy_accepted && this.state.agreements.info_accuracy_confirmed && this.state.agreements.verification_consent;
            if (guideNeeds) {
                canSubmitTerms = canSubmitTerms && this.state.agreements.commission_policy_accepted && this.state.agreements.safety_guidelines_accepted;
            }
            primaryDisabled = !canSubmitTerms;
        }

        var modalMarkup = '';
        if (this.modalOpen) {
            modalMarkup = [
                '<div class="auth-modal-backdrop" data-action="close-modal">',
                '<div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="authSubmitTitle" onclick="event.stopPropagation()">',
                '<h3 id="authSubmitTitle">Confirm account submission</h3>',
                '<p>Your onboarding details will be submitted for verification review. Sensitive documents are marked as encrypted and queued for backend processing.</p>',
                '<div class="auth-footer">',
                '<button type="button" class="auth-btn-ghost" data-action="close-modal">Cancel</button>',
                '<button type="button" class="auth-btn" data-action="confirm-submit">Confirm & Submit</button>',
                '</div>',
                '</div>',
                '</div>'
            ].join('');
        }

        var footerPrimary = '<button type="button" class="auth-btn" data-action="primary-step" ' + (primaryDisabled ? 'disabled' : '') + '>' + esc(primaryLabel) + '</button>';

        this.root.innerHTML = [
            '<div class="auth-top-row"><a class="auth-back-home" href="index.html">\u2190 Back to Home</a></div>',
            this.consumeAlert(),
            '<div class="auth-stepper">',
            '<div class="auth-stepper-track" style="--step-count:' + steps.length + '">' + stepper + '</div>',
            '<div class="auth-step-hint">Step ' + (currentIndex + 1) + ' of ' + steps.length + ' • ' + esc(stepMeta.title) + '</div>',
            '</div>',
            '<section class="auth-card">',
            bodyMarkup,
            this.state.ui.success_state ? '<div class="auth-success-state"><h3>Account submitted for review</h3></div>' : '',
            '<div class="auth-footer">',
            footerLeft,
            footerPrimary,
            '</div>',
            '</section>',
            modalMarkup
        ].join('');

        this.bindRegisterEvents();
    };

    AuthController.prototype.renderRegisterStep = function (step) {
        if (step === 'email_verification') {
            return this.renderStepEmail();
        }
        if (step === 'otp_verification') {
            return this.renderStepOtp();
        }
        if (step === 'role_selection') {
            return this.renderStepRole();
        }
        if (step === 'personal_information') {
            return this.renderStepPersonal();
        }
        if (step === 'security_setup') {
            return this.renderStepSecurity();
        }
        if (step === 'terms_consent') {
            return this.renderStepTerms();
        }
        return this.renderStepReview();
    };

    AuthController.prototype.renderStepEmail = function () {
        var fieldClass = this.fieldClass('auth.email');
        return [
            '<p class="auth-section-kicker">Create account</p>',
            '<h2 class="auth-title">Start with your email</h2>',
            '<p class="auth-subtitle">We will send a one-time code to verify your email before account setup.</p>',
            '<div class="auth-grid single">',
            '<div class="auth-field ' + esc(fieldClass) + '">',
            '<label for="emailInput">Email address <span class="auth-required">*</span></label>',
            '<input id="emailInput" class="auth-input" type="email" autocomplete="email" data-path="auth.email" value="' + esc(this.state.auth.email || '') + '" placeholder="name@example.com">',
            '<small class="auth-error">' + this.inlineError('auth.email') + '</small>',
            '</div>',
            '</div>',
            '<div class="auth-inline-links">Already have an account? <a href="sign-in.html">Login</a></div>'
        ].join('');
    };

    AuthController.prototype.renderStepOtp = function () {
        var otpDigits = (this.state.auth.otp_input || '').split('');
        var inputs = [];
        for (var i = 0; i < OTP_LENGTH; i += 1) {
            inputs.push('<input class="auth-otp-input" inputmode="numeric" maxlength="1" pattern="\\d*" data-otp-index="' + i + '" value="' + esc(otpDigits[i] || '') + '" aria-label="OTP digit ' + (i + 1) + '">');
        }

        var expiresRemain = this.state.auth.otp_expires_at ? Math.max(0, this.state.auth.otp_expires_at - now()) : 0;
        var resendRemain = this.state.auth.otp_resend_available_at ? Math.max(0, this.state.auth.otp_resend_available_at - now()) : 0;
        var lockedRemain = this.state.auth.otp_rate_limit_until ? Math.max(0, this.state.auth.otp_rate_limit_until - now()) : 0;

        return [
            '<p class="auth-section-kicker">Email verification</p>',
            '<h2 class="auth-title">Enter your OTP code</h2>',
            '<p class="auth-subtitle">A 6-digit verification code was sent to <strong>' + esc(this.state.auth.email || 'your email') + '</strong>.</p>',
            '<div class="auth-alert info">Demo validation OTP: <strong>' + esc(FAKE_OTP_CODE) + '</strong></div>',
            '<div class="auth-otp-wrap ' + esc(this.fieldClass('auth.otp_input')) + '">',
            '<div class="auth-otp-inputs">' + inputs.join('') + '</div>',
            '<small class="auth-error">' + this.inlineError('auth.otp_input') + '</small>',
            '</div>',
            '<div class="auth-otp-meta">',
            '<span>Code expires in <strong data-otp-countdown>' + (expiresRemain ? this.msToClock(expiresRemain) : 'Expired') + '</strong></span>',
            '<span>Rate limit <strong data-rate-limit-countdown>' + (lockedRemain ? this.msToClock(lockedRemain) : 'None') + '</strong></span>',
            '</div>',
            '<div class="auth-otp-meta">',
            '<span>Resend available in <strong data-resend-countdown>' + (resendRemain ? this.msToClock(resendRemain) : 'Ready') + '</strong></span>',
            '<button type="button" class="auth-resend-btn" data-action="resend-otp" ' + (resendRemain ? 'disabled' : '') + '>Resend OTP</button>',
            '</div>',
            '<div class="auth-trust-note"><i class="fa-solid fa-lock" aria-hidden="true"></i><span>OTP requests are rate-limited to reduce fraud and abuse risk.</span></div>'
        ].join('');
    };

    AuthController.prototype.renderStepRole = function () {
        return [
            '<p class="auth-section-kicker">Role selection</p>',
            '<h2 class="auth-title">Choose your Tribaltours role</h2>',
            '<div class="auth-role-grid">',
            '<button type="button" class="auth-role-card ' + (this.state.role === 'tourist' ? 'is-selected' : '') + '" data-role-select="tourist">',
            '<span class="auth-role-icon"><i class="fa-solid fa-map-location-dot"></i></span>',
            '<h3>Tourist</h3>',
            '<p>Book experiences, save trips, and explore curated local destinations.</p>',
            '</button>',
            '<button type="button" class="auth-role-card ' + (this.state.role === 'guide' ? 'is-selected' : '') + '" data-role-select="guide">',
            '<span class="auth-role-icon"><i class="fa-solid fa-compass-drafting"></i></span>',
            '<h3>Tour Guide</h3>',
            '<p>Create guided experiences, manage bookings, and earn from local tourism.</p>',
            '</button>',
            '</div>',
            this.getError('role') ? '<small class="auth-error" style="display:block">' + this.inlineError('role') + '</small>' : ''
        ].join('');
    };

    AuthController.prototype.renderNationalityPicker = function () {
        var current = this.state.personal.nationality || '';
        var options = COUNTRIES.map(function (country) {
            var selected = current === country ? ' selected' : '';
            return '<option value="' + esc(country) + '"' + selected + '>' + esc(country) + '</option>';
        }).join('');
        return '<select class="auth-select" data-path="personal.nationality" aria-label="Citizenship or nationality"><option value="">Select citizenship or nationality</option>' + options + '</select>';
    };

    AuthController.prototype.renderStepPersonal = function () {
        var genderOptions = ['Male', 'Female', 'Prefer not to say'];
        var genderButtons = genderOptions.map(function (option) {
            return '<button type="button" class="' + (this.state.personal.gender === option ? 'is-selected' : '') + '" data-gender-value="' + esc(option) + '">' + esc(option) + '</button>';
        }, this).join('');

        var phoneOptions = PHONE_COUNTRIES.map(function (item) {
            var selected = item.code === this.state.personal.mobile_country_code ? 'selected' : '';
            return '<option value="' + esc(item.code) + '" ' + selected + '>' + esc(item.code + ' ' + item.name) + '</option>';
        }, this).join('');

        var isGuide = this.state.role === 'guide';
        var ageMinimum = isGuide ? 21 : 18;

        return [
            '<p class="auth-section-kicker">Personal details</p>',
            '<h2 class="auth-title">Tell us about yourself</h2>',
            '<div class="auth-grid">',
            this.textField('personal.first_name', 'First name', true),
            this.textField('personal.middle_name', 'Middle name', false),
            this.textField('personal.last_name', 'Last name', true),
            this.textField('personal.suffix', 'Suffix', false),
            '<div class="auth-field full ' + esc(this.fieldClass('personal.gender')) + '"><label>Gender <span class="auth-required">*</span></label><div class="auth-segment">' + genderButtons + '</div><small class="auth-error">' + this.inlineError('personal.gender') + '</small></div>',
            this.dateField('personal.birth_date', 'Date of birth', true),
            '<div class="auth-field ' + esc(this.fieldClass('personal.age')) + '"><label>Age (auto-calculated)</label><input class="auth-input" type="text" value="' + esc(this.state.personal.age || '') + '" readonly><small class="auth-error">' + this.inlineError('personal.age') + '</small></div>',
            '<div class="auth-field full ' + esc(this.fieldClass('personal.nationality')) + '"><label>Citizenship / Nationality <span class="auth-required">*</span></label>' + this.renderNationalityPicker() + '<small class="auth-error">' + this.inlineError('personal.nationality') + '</small></div>',
            '<div class="auth-field full ' + esc(this.fieldClass('personal.mobile_number_local')) + '"><label>Mobile number <span class="auth-required">*</span></label><div class="auth-phone-wrap"><select class="auth-phone-code" data-path="personal.mobile_country_code">' + phoneOptions + '</select><input class="auth-phone-number" type="tel" value="' + esc(this.state.personal.mobile_number_local || '') + '" data-path="personal.mobile_number_local" placeholder="Phone number"></div><small class="auth-error">' + this.inlineError('personal.mobile_number_local') + '</small><small class="auth-hint">Stored as local and E.164 format for backend parsing.</small></div>',
            isGuide ? this.emailField('personal.email_address', 'Email address', true) : '',
            this.textField('personal.current_address', 'Current address', true, true),
            this.textField('personal.city', 'City', true),
            isGuide ? this.textField('personal.province_state', 'Province / State', true) : '',
            this.textField('personal.country', 'Country', true),
            '</div>'
        ].join('');
    };

    AuthController.prototype.renderStepIdentity = function () {
        var role = this.state.role || 'tourist';
        var options = ID_TYPES[role].map(function (item) {
            var selected = item === this.state.identity.government_id_type ? 'selected' : '';
            return '<option value="' + esc(item) + '" ' + selected + '>' + esc(item) + '</option>';
        }, this).join('');

        var backOptional = !!ID_TYPES_WITH_OPTIONAL_BACK[this.state.identity.government_id_type];

        return [
            '<p class="auth-section-kicker">Identity verification</p>',
            '<h2 class="auth-title">Upload your government ID</h2>',
            '<p class="auth-subtitle">Secure OCR-ready upload cards with progress states, retries, and file validation (JPG, PNG, PDF up to 10 MB).</p>',
            '<div class="auth-grid single">',
            '<div class="auth-field ' + esc(this.fieldClass('identity.government_id_type')) + '">',
            '<label>Government ID Type <span class="auth-required">*</span></label>',
            '<select class="auth-select" data-path="identity.government_id_type"><option value="">Select ID type</option>' + options + '</select>',
            '<small class="auth-error">' + this.inlineError('identity.government_id_type') + '</small>',
            '</div>',
            '</div>',
            '<div class="auth-upload-grid">',
            this.uploadFieldMarkup('identity.government_id_front', 'Government ID Front', 'JPG, PNG, PDF • max 10 MB'),
            this.uploadFieldMarkup('identity.government_id_back', 'Government ID Back ' + (backOptional ? '(optional)' : ''), 'JPG, PNG, PDF • max 10 MB'),
            '</div>',
            '<div class="auth-trust-note"><i class="fa-solid fa-shield-halved"></i><span>Secure upload indicators help establish account legitimacy and fraud prevention.</span></div>'
        ].join('');
    };

    AuthController.prototype.renderStepProfessional = function () {
        var selectedCategories = this.state.professional.tour_categories || [];
        var tags = TOUR_CATEGORIES.map(function (tag) {
            var selected = selectedCategories.indexOf(tag) >= 0;
            return '<button type="button" class="auth-pill-tag ' + (selected ? 'is-selected' : '') + '" data-category-value="' + esc(tag) + '">' + esc(tag) + '</button>';
        }).join('');

        return [
            '<p class="auth-section-kicker">Professional verification</p>',
            '<h2 class="auth-title">Compliance and credentials</h2>',
            '<p class="auth-subtitle">Guide onboarding includes legal documents, optional credentials, and experience profile fields for trust and marketplace visibility.</p>',
            '<div class="auth-grid">',
            this.uploadFieldMarkup('professional.nbi_clearance', 'NBI Clearance', 'PDF, JPG, PNG • validation badge ready'),
            this.dateField('professional.nbi_expiration_date', 'NBI expiration date', true),
            this.uploadFieldMarkup('professional.barangay_clearance', 'Barangay Clearance', 'PDF, JPG, PNG • issued document'),
            this.dateField('professional.barangay_issued_date', 'Barangay issued date', true),
            this.textField('professional.guide_certificate_number', 'Tour guide certificate number', false),
            this.uploadFieldMarkup('professional.guide_certificate_upload', 'Certificate Upload (optional)', 'Optional but strongly recommended for higher trust and visibility.'),
            this.uploadFieldMarkup('professional.tourism_accreditation_upload', 'Tourism Accreditation Upload (optional)', 'Optional accreditation document'),
            this.textField('professional.years_of_experience', 'Years of guiding experience', false),
            this.textField('professional.languages_spoken', 'Languages spoken', false, true),
            this.textField('professional.areas_of_expertise', 'Areas of expertise', false, true),
            '<div class="auth-field full"><label>Tour categories</label><div class="auth-pill-tags">' + tags + '</div><small class="auth-hint">Multi-select tags for backend-ready categories[] payload.</small></div>',
            '</div>'
        ].join('');
    };

    AuthController.prototype.renderStepSecurity = function () {
        var passwordInfo = evaluatePassword(this.state.security.password || '');
        var width = (passwordInfo.score / 5) * 100;
        var meterColor = '#ca6a63';
        if (passwordInfo.score >= 4) {
            meterColor = '#89a94e';
        } else if (passwordInfo.score >= 3) {
            meterColor = '#bd9746';
        }

        var rules = [
            { key: 'min8', label: 'At least 8 characters' },
            { key: 'upper', label: 'At least 1 uppercase letter' },
            { key: 'lower', label: 'At least 1 lowercase letter' },
            { key: 'number', label: 'At least 1 number' },
            { key: 'special', label: 'At least 1 special character' }
        ].map(function (rule) {
            var ok = passwordInfo.rules[rule.key];
            return '<div class="auth-rule ' + (ok ? 'is-valid' : '') + '"><i class="fa-solid ' + (ok ? 'fa-circle-check' : 'fa-circle') + '"></i><span>' + esc(rule.label) + '</span></div>';
        }).join('');

        return [
            '<p class="auth-section-kicker">Security setup</p>',
            '<h2 class="auth-title">Create a secure password</h2>',
            '<p class="auth-subtitle">Real-time strength meter and live validation checklist aligned with production authentication standards.</p>',
            '<div class="auth-grid">',
            this.passwordField('security.password', 'Password', true),
            this.passwordField('security.confirm_password', 'Confirm password', true),
            '<div class="auth-field full">',
            '<label>Password strength</label>',
            '<div class="auth-password-meter"><span style="width:' + width + '%;background:' + meterColor + '"></span></div>',
            '<div class="auth-password-rules">' + rules + '</div>',
            '</div>',
            '</div>'
        ].join('');
    };

    AuthController.prototype.renderStepTerms = function () {
        var isGuide = this.state.role === 'guide';
        return [
            '<p class="auth-section-kicker">Terms and consent</p>',
            '<h2 class="auth-title">Consent before submission</h2>',
            '<p class="auth-subtitle">Final submission stays disabled until all required agreements are accepted.</p>',
            '<div class="auth-consent-list">',
            this.checkboxRow('agreements.terms_accepted', 'I agree to the Terms & Conditions', true),
            this.checkboxRow('agreements.privacy_accepted', 'I agree to the Privacy Policy', true),
            this.checkboxRow('agreements.info_accuracy_confirmed', 'I confirm that the information provided is accurate', true),
            this.checkboxRow('agreements.verification_consent', 'I consent to identity verification', true),
            isGuide ? this.checkboxRow('agreements.commission_policy_accepted', 'I agree to platform commission policies', true) : '',
            isGuide ? this.checkboxRow('agreements.safety_guidelines_accepted', 'I agree to community safety guidelines', true) : '',
            '</div>',
            '<div class="auth-trust-note"><i class="fa-solid fa-circle-check"></i><span>Verification pending badge and account review state will appear after submission.</span></div>'
        ].join('');
    };

    AuthController.prototype.renderStepReview = function () {
        return [
            '<p class="auth-section-kicker">Review and confirmation</p>',
            '<h2 class="auth-title">Final account review</h2>',
            '<p class="auth-subtitle">Review your personal information, then click Done to continue to your guide dashboard.</p>',
            '<div class="auth-review-block"><h3>Personal information</h3><ul class="auth-review-list"><li><strong>Full name</strong> <span>' + esc([this.state.personal.first_name, this.state.personal.middle_name, this.state.personal.last_name, this.state.personal.suffix].filter(Boolean).join(' ')) + '</span></li><li><strong>Gender</strong> <span>' + esc(this.state.personal.gender || '-') + '</span></li><li><strong>Birth date / Age</strong> <span>' + esc(this.state.personal.birth_date || '-') + ' / ' + esc(this.state.personal.age || '-') + '</span></li><li><strong>Nationality</strong> <span>' + esc(this.state.personal.nationality || '-') + '</span></li><li><strong>Phone</strong> <span>' + esc(this.state.personal.mobile_number_e164 || '-') + '</span></li><li><strong>Address</strong> <span>' + esc(this.state.personal.current_address || '-') + '</span></li><li><strong>City</strong> <span>' + esc(this.state.personal.city || '-') + '</span></li><li><strong>Country</strong> <span>' + esc(this.state.personal.country || '-') + '</span></li></ul></div>'
        ].join('');
    };

    AuthController.prototype.buildPayload = function () {
        return {
            authentication: {
                email: this.state.auth.email,
                password: this.state.security.password,
                otp_verification_status: this.state.auth.otp_verified,
                role: this.state.role
            },
            personal_information: {
                full_name: {
                    first_name: this.state.personal.first_name,
                    middle_name: this.state.personal.middle_name,
                    last_name: this.state.personal.last_name,
                    suffix: this.state.personal.suffix
                },
                gender: this.state.personal.gender,
                birth_date: this.state.personal.birth_date,
                age: this.state.personal.age,
                nationality: this.state.personal.nationality,
                phone_number: {
                    country_code: this.state.personal.mobile_country_code,
                    local_number: cleanDigits(this.state.personal.mobile_number_local),
                    e164: this.state.personal.mobile_number_e164
                },
                email_address: this.state.personal.email_address || this.state.auth.email
            },
            address_information: {
                full_address: this.state.personal.current_address,
                city: this.state.personal.city,
                province: this.state.personal.province_state,
                country: this.state.personal.country
            },
            agreements: {
                terms_accepted: this.state.agreements.terms_accepted,
                privacy_accepted: this.state.agreements.privacy_accepted,
                verification_consent: this.state.agreements.verification_consent,
                info_accuracy_confirmed: this.state.agreements.info_accuracy_confirmed,
                commission_policy_accepted: this.state.agreements.commission_policy_accepted,
                safety_guidelines_accepted: this.state.agreements.safety_guidelines_accepted
            },
            metadata: {
                account_review_status: this.state.ui.success_state ? 'pending_review' : 'draft',
                source: 'web_onboarding_ui',
                generated_at: new Date().toISOString(),
                laravel_ready: true,
                csrf_ready: true,
                queue_ready: true
            }
        };
    };

    AuthController.prototype.textField = function (path, label, required, fullWidth) {
        var cls = this.fieldClass(path);
        var value = getPath(this.state, path) || '';
        return [
            '<div class="auth-field ' + (fullWidth ? 'full ' : '') + esc(cls) + '">',
            '<label>' + esc(label) + (required ? ' <span class="auth-required">*</span>' : '') + '</label>',
            '<input class="auth-input" type="text" data-path="' + esc(path) + '" value="' + esc(value) + '">',
            '<small class="auth-error">' + this.inlineError(path) + '</small>',
            '</div>'
        ].join('');
    };

    AuthController.prototype.emailField = function (path, label, required) {
        var cls = this.fieldClass(path);
        var value = getPath(this.state, path) || '';
        return [
            '<div class="auth-field ' + esc(cls) + '">',
            '<label>' + esc(label) + (required ? ' <span class="auth-required">*</span>' : '') + '</label>',
            '<input class="auth-input" type="email" data-path="' + esc(path) + '" value="' + esc(value) + '">',
            '<small class="auth-error">' + this.inlineError(path) + '</small>',
            '</div>'
        ].join('');
    };

    AuthController.prototype.dateField = function (path, label, required) {
        var cls = this.fieldClass(path);
        var value = formatDateISO(getPath(this.state, path));
        return [
            '<div class="auth-field ' + esc(cls) + '">',
            '<label>' + esc(label) + (required ? ' <span class="auth-required">*</span>' : '') + '</label>',
            '<input class="auth-input" type="date" data-path="' + esc(path) + '" value="' + esc(value) + '">',
            '<small class="auth-error">' + this.inlineError(path) + '</small>',
            '</div>'
        ].join('');
    };

    AuthController.prototype.passwordField = function (path, label, required) {
        var cls = this.fieldClass(path);
        var value = getPath(this.state, path) || '';
        return [
            '<div class="auth-field ' + esc(cls) + '">',
            '<label>' + esc(label) + (required ? ' <span class="auth-required">*</span>' : '') + '</label>',
            '<div class="auth-inline">',
            '<input class="auth-input" style="flex:1" type="password" data-path="' + esc(path) + '" value="' + esc(value) + '">',
            '<button type="button" class="auth-chip-btn" data-action="toggle-password">Show</button>',
            '</div>',
            '<small class="auth-error">' + this.inlineError(path) + '</small>',
            '</div>'
        ].join('');
    };

    AuthController.prototype.checkboxRow = function (path, label) {
        var checked = !!getPath(this.state, path);
        return '<label class="auth-check-row"><input type="checkbox" data-path="' + esc(path) + '" ' + (checked ? 'checked' : '') + '><span>' + esc(label) + '</span></label>';
    };

    AuthController.prototype.syncFieldValidationUI = function (field, path) {
        var wrapper = field && field.closest ? field.closest('.auth-field') : null;
        if (!wrapper) {
            return;
        }
        wrapper.classList.remove('is-valid', 'is-invalid');
        var touched = !!this.state.ui.touched[path] || this.state.ui.is_submitted;
        if (touched) {
            wrapper.classList.add(this.state.ui.errors[path] ? 'is-invalid' : 'is-valid');
        }
        var errorNode = qs('.auth-error', wrapper);
        if (errorNode) {
            errorNode.textContent = this.getError(path) || '';
        }
    };

    AuthController.prototype.bindRegisterEvents = function () {
        var self = this;

        qsa('[data-path]', this.root).forEach(function (field) {
            var path = field.dataset.path;
            var eventName = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
            field.addEventListener(eventName, function () {
                var value;
                if (field.type === 'checkbox') {
                    value = field.checked;
                } else {
                    value = field.value;
                }

                if (path === 'personal.mobile_number_local') {
                    value = formatPhoneDigits(value);
                    field.value = value;
                }

                setPath(self.state, path, value);
                self.markTouched(path);
                self.updateDerivedValues();

                if (path === 'identity.government_id_type') {
                    if (ID_TYPES_WITH_OPTIONAL_BACK[value]) {
                        self.clearStepComplete('identity_verification');
                    }
                }

                if (path === 'auth.email') {
                    self.state.personal.email_address = value;
                    self.state.auth.otp_verified = false;
                    self.clearStepComplete('otp_verification');
                }

                self.validateCurrentStep();

                var shouldRender = field.type === 'checkbox' || field.tagName === 'SELECT' || path === 'personal.birth_date';

                self.saveRegisterState();

                if (shouldRender) {
                    self.renderRegister();
                    return;
                }

                self.syncFieldValidationUI(field, path);
            });
        });

        qsa('[data-role-select]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.state.role = button.dataset.roleSelect;
                self.markTouched('role');
                self.validateCurrentStep();
                self.saveRegisterState();
                self.renderRegister();
            });
        });

        qsa('[data-gender-value]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.state.personal.gender = button.dataset.genderValue;
                self.markTouched('personal.gender');
                self.validateCurrentStep();
                self.saveRegisterState();
                self.renderRegister();
            });
        });

        qsa('[data-category-value]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.dataset.categoryValue;
                var list = self.state.professional.tour_categories || [];
                var index = list.indexOf(value);
                if (index === -1) {
                    list.push(value);
                } else {
                    list.splice(index, 1);
                }
                self.state.professional.tour_categories = list;
                self.saveRegisterState();
                self.renderRegister();
            });
        });

        qsa('[data-step-jump]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                var stepId = button.dataset.stepJump;
                var steps = self.getSteps();
                var currentIndex = steps.indexOf(self.currentStep());
                var targetIndex = steps.indexOf(stepId);
                var canGo = targetIndex <= currentIndex || !!self.state.progress.completed_steps[steps[targetIndex - 1]];
                if (canGo) {
                    self.setCurrentStep(stepId);
                }
            });
        });

        qsa('[data-action="primary-step"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.handlePrimaryAction();
            });
        });

        qsa('[data-action="prev-step"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.prevStep();
            });
        });

        qsa('[data-action="resend-otp"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.resendOtp();
            });
        });

        qsa('[data-action="toggle-password"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                var input = button.parentElement ? qs('input', button.parentElement) : null;
                if (!input) {
                    return;
                }
                input.type = input.type === 'password' ? 'text' : 'password';
                button.textContent = input.type === 'password' ? 'Show' : 'Hide';
            });
        });

        qsa('[data-action="reset-flow"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.resetFlow();
            });
        });

        qsa('[data-action="close-modal"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.modalOpen = false;
                self.renderRegister();
            });
        });

        qsa('[data-action="confirm-submit"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.confirmSubmit();
            });
        });

        this.bindOtpInputs();
        this.bindUploadInputs();
    };

    AuthController.prototype.bindOtpInputs = function () {
        var self = this;
        var inputs = qsa('[data-otp-index]', this.root);
        if (!inputs.length) {
            return;
        }

        function syncOtpFromFields() {
            var value = inputs.map(function (input) {
                return cleanDigits(input.value).slice(0, 1);
            }).join('');
            self.state.auth.otp_input = value;
            self.markTouched('auth.otp_input');
            self.saveRegisterState();
            self.validateCurrentStep();
            if (value.length === OTP_LENGTH) {
                self.renderRegister();
            }
        }

        inputs.forEach(function (input, index) {
            input.addEventListener('input', function () {
                input.value = cleanDigits(input.value).slice(0, 1);
                if (input.value && inputs[index + 1]) {
                    inputs[index + 1].focus();
                }
                syncOtpFromFields();
            });

            input.addEventListener('keydown', function (event) {
                if (event.key === 'Backspace' && !input.value && inputs[index - 1]) {
                    inputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', function (event) {
                var text = (event.clipboardData || window.clipboardData).getData('text');
                var digits = cleanDigits(text).slice(0, OTP_LENGTH);
                if (!digits) {
                    return;
                }
                digits.split('').forEach(function (digit, idx) {
                    if (inputs[idx]) {
                        inputs[idx].value = digit;
                    }
                });
                syncOtpFromFields();
                event.preventDefault();
            });
        });
    };

    AuthController.prototype.bindUploadInputs = function () {
        var self = this;
        qsa('[data-upload-path]', this.root).forEach(function (dropzone) {
            var path = dropzone.dataset.uploadPath;
            var fileInput = qs('[data-file-input="' + path + '"]', self.root);

            dropzone.addEventListener('click', function () {
                if (fileInput) {
                    fileInput.click();
                }
            });

            dropzone.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (fileInput) {
                        fileInput.click();
                    }
                }
            });

            dropzone.addEventListener('dragover', function (event) {
                event.preventDefault();
                dropzone.classList.add('is-dragover');
            });

            dropzone.addEventListener('dragleave', function () {
                dropzone.classList.remove('is-dragover');
            });

            dropzone.addEventListener('drop', function (event) {
                event.preventDefault();
                dropzone.classList.remove('is-dragover');
                var files = event.dataTransfer && event.dataTransfer.files;
                if (files && files[0]) {
                    self.handleUploadFile(path, files[0]);
                }
            });

            if (fileInput) {
                fileInput.addEventListener('change', function () {
                    if (fileInput.files && fileInput.files[0]) {
                        self.handleUploadFile(path, fileInput.files[0]);
                    }
                });
            }
        });

        qsa('[data-action="remove-upload"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                var path = button.dataset.uploadPath;
                if (self.uploadTimers[path]) {
                    clearInterval(self.uploadTimers[path]);
                    delete self.uploadTimers[path];
                }
                setPath(self.state, path, null);
                self.markTouched(path);
                self.validateCurrentStep();
                self.saveRegisterState();
                self.renderRegister();
            });
        });

        qsa('[data-action="retry-upload"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                var path = button.dataset.uploadPath;
                var existing = getPath(self.state, path);
                if (!existing) {
                    return;
                }
                existing.status = 'uploading';
                existing.progress = 0;
                existing.failed_message = '';
                self.simulateUpload(path);
                self.saveRegisterState();
                self.renderRegister();
            });
        });
    };

    AuthController.prototype.handleUploadFile = function (path, file) {
        var allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        var extAllowed = /\.(jpg|jpeg|png|pdf)$/i.test(file.name || '');
        if (allowed.indexOf(file.type) === -1 && !extAllowed) {
            this.state.ui.errors[path] = 'Invalid file type. Allowed: JPG, PNG, PDF.';
            this.markTouched(path);
            this.renderRegister();
            return;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
            this.state.ui.errors[path] = 'File exceeds 10 MB size limit.';
            this.markTouched(path);
            this.renderRegister();
            return;
        }

        var record = createFileRecord(file);
        setPath(this.state, path, record);
        this.markTouched(path);
        this.validateCurrentStep();
        this.saveRegisterState();
        this.renderRegister();
        this.simulateUpload(path);
    };

    AuthController.prototype.simulateUpload = function (path) {
        var self = this;
        if (this.uploadTimers[path]) {
            clearInterval(this.uploadTimers[path]);
        }

        this.uploadTimers[path] = setInterval(function () {
            var file = getPath(self.state, path);
            if (!file || file.status !== 'uploading') {
                clearInterval(self.uploadTimers[path]);
                delete self.uploadTimers[path];
                return;
            }

            file.progress = Math.min(100, file.progress + Math.floor(Math.random() * 18 + 8));
            if (file.progress >= 100) {
                if (Math.random() < 0.08) {
                    file.status = 'failed';
                    file.failed_message = 'Upload failed due to unstable network. Retry upload.';
                } else {
                    file.status = 'uploaded';
                    file.progress = 100;
                    file.failed_message = '';
                    file.uploaded_at = new Date().toISOString();
                }
                clearInterval(self.uploadTimers[path]);
                delete self.uploadTimers[path];
            }

            self.saveRegisterState();
            var liveCard = qs('[data-upload-card="' + path + '"]', self.root);
            if (liveCard) {
                self.renderRegister();
            }
        }, 150);
    };

    AuthController.prototype.renderSignIn = function () {
        var st = this.signInState;
        var isForgot = st.view === 'forgot';
        var panel = this.root.closest('.auth-panel');
        if (panel) {
            panel.classList.add('is-centered-layout');
        }

        this.root.innerHTML = [
            '<div class="auth-top-row"><a class="auth-back-home" href="index.html">\u2190 Back to Home</a></div>',
            st.otp_notice ? '<div class="auth-alert success">' + esc(st.otp_notice) + '</div>' : '',
            '<section class="auth-card">',
            '<p class="auth-section-kicker">Welcome back</p>',
            '<h2 class="auth-title">' + (isForgot ? 'Forgot your password?' : 'Tribaltours Login') + '</h2>',
            '<p class="auth-subtitle">' + (isForgot ? 'Enter your email and we will send a secure password reset link.' : 'Sign in to view bookings, likes, and upcoming tours.') + '</p>',
            isForgot ? this.renderForgotCard() : this.renderLoginCard(),
            '</section>'
        ].join('');

        this.bindSignInEvents();
    };

    AuthController.prototype.renderLoginCard = function () {
        var role = this.signInState.role;
        return [
            '<div class="auth-view-toggle">',
            '<button type="button" data-signin-role="tourist" class="' + (role === 'tourist' ? 'is-active' : '') + '">Tourist</button>',
            '<button type="button" data-signin-role="guide" class="' + (role === 'guide' ? 'is-active' : '') + '">Tour Guide</button>',
            '</div>',
            '<div class="auth-grid single" style="margin-top:14px">',
            '<div class="auth-field"><label>Email</label><input class="auth-input" type="email" data-signin-path="email" value="' + esc(this.signInState.email || '') + '"></div>',
            '<div class="auth-field"><label>Password</label><div class="auth-inline"><input class="auth-input" style="flex:1" type="password" data-signin-path="password" value="' + esc(this.signInState.password || '') + '"><button type="button" class="auth-chip-btn" data-action="toggle-signin-password">Show</button></div></div>',
            '</div>',
            '<div class="auth-footer" style="margin-top:8px">',
            '<label class="auth-check-row"><input type="checkbox" data-signin-path="remember" ' + (this.signInState.remember ? 'checked' : '') + '><span>Remember me</span></label>',
            '<button type="button" class="auth-link-btn" data-action="show-forgot">Forgot password?</button>',
            '</div>',
            '<div class="auth-footer">',
            '<button type="button" class="auth-btn" data-action="signin-submit">Sign In</button>',
            '</div>',
            '<div class="auth-inline-links">Need an account? <a href="get-started.html">Start signup</a></div>'
        ].join('');
    };

    AuthController.prototype.renderForgotCard = function () {
        return [
            '<div class="auth-grid single" style="margin-top:14px">',
            '<div class="auth-field"><label>Email address</label><input class="auth-input" type="email" data-signin-path="forgot_email" value="' + esc(this.signInState.forgot_email || '') + '"></div>',
            '</div>',
            '<div class="auth-footer">',
            '<button type="button" class="auth-btn" data-action="send-reset-link">Email reset link</button>',
            '</div>',
            '<div class="auth-inline-links">Back to <a href="#" data-action="show-login">tourist login</a></div>'
        ].join('');
    };

    AuthController.prototype.bindSignInEvents = function () {
        var self = this;

        qsa('[data-signin-role]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.signInState.role = button.dataset.signinRole;
                self.saveSignInState();
                self.renderSignIn();
            });
        });

        qsa('[data-signin-path]', this.root).forEach(function (field) {
            var path = field.dataset.signinPath;
            var eventName = field.type === 'checkbox' ? 'change' : 'input';
            field.addEventListener(eventName, function () {
                self.signInState[path] = field.type === 'checkbox' ? field.checked : field.value;
                self.saveSignInState();
            });
        });

        qsa('[data-action="toggle-signin-password"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                var input = button.parentElement ? qs('input', button.parentElement) : null;
                if (!input) {
                    return;
                }
                input.type = input.type === 'password' ? 'text' : 'password';
                button.textContent = input.type === 'password' ? 'Show' : 'Hide';
            });
        });

        qsa('[data-action="show-forgot"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                self.signInState.view = 'forgot';
                self.saveSignInState();
                self.renderSignIn();
            });
        });

        qsa('[data-action="show-login"]', this.root).forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                self.signInState.view = 'login';
                self.saveSignInState();
                self.renderSignIn();
            });
        });

        qsa('[data-action="send-reset-link"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                if (!emailIsValid(self.signInState.forgot_email)) {
                    self.signInState.otp_notice = 'Enter a valid email before requesting a reset link.';
                    self.saveSignInState();
                    self.renderSignIn();
                    return;
                }
                self.signInState.otp_notice = 'Password reset link sent to ' + self.signInState.forgot_email + '.';
                self.signInState.view = 'login';
                self.saveSignInState();
                self.renderSignIn();
            });
        });

        qsa('[data-action="signin-submit"]', this.root).forEach(function (button) {
            button.addEventListener('click', function () {
                if (!emailIsValid(self.signInState.email) || !self.signInState.password) {
                    self.signInState.otp_notice = 'Provide valid login credentials.';
                    self.saveSignInState();
                    self.renderSignIn();
                    return;
                }
                localStorage.setItem(ROLE_KEY, self.signInState.role);
                self.signInState.otp_notice = 'Login successful. Redirecting to workspace...';
                self.saveSignInState();
                self.renderSignIn();
                setTimeout(function () {
                    window.location.href = 'explore.html';
                }, 650);
            });
        });
    };

    function init() {
        var appRoot = qs('#authApp');
        if (!appRoot) {
            return;
        }
        var controller = new AuthController(appRoot);
        controller.init();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
