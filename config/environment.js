const development = {
    name: 'development',
    asset_path: './assets',
    session_cookie_key: 'c2M4jEO7J5N8BHkpUrmUfVLwBDPcxbd6',
    db: 'inventory_data',
    account_SID: 'AC3cac2f780654d7f7f67303bbbebbf85e',
    auth_Token: '8ad4ce6c4591ae00d4bbd6fd72333c1d',
    twilio_phone_number: '+14693522747',
    admin_key: 'D5F28',

    smtp:
    {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'pransharma011@gmail.com',
            pass: 'fjbezpapgeokgoco'
        }

    },
    JWT_SECRET: 'Fq35zfYJV9UeBkMcv1dujqVzgHrPHphK',

    hospital_name: 'XYZ Hospital',
    hospital_address: 'Z-Block, ABC City ',
    website: 'http://hospital.in',
    hospital_email: 'hospital@gmail.com',
    hospital_mobile: '+5557 789-1234',
    gst_number: 'xyz12345',

}
const production = {
    name: 'production',
    asset_path: './assets',
    session_cookie_key: 'c2M4jEO7J5N8BHkpUrmUfVLwBDPcxbd6',
    db: 'inventory_data',
    account_SID: 'AC3cac2f780654d7f7f67303bbbebbf85e',
    auth_Token: '8ad4ce6c4591ae00d4bbd6fd72333c1d',
    twilio_phone_number: '+14693522747',
    admin_key: 'D5F28',
    smtp:
    {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'pransharma011@gmail.com',
            pass: 'fjbezpapgeokgoco'
        }

    },
    JWT_SECRET: 'Fq35zfYJV9UeBkMcv1dujqVzgHrPHphK',

    hospital_name: 'XYZ Hospital',
    hospital_address: 'Z-Block, ABC City ',
    website: 'http://hospital.in',
    hospital_email: 'hospital@gmail.com',
    hospital_mobile: '+5557 789-1234',
    gst_number: 'xyz12345',
}


module.exports = development;