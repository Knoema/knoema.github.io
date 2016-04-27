
getCountriesByRegion = function(region) {
    switch (region){
        case 'COMESA':
            return ['Djibouti', 'Eritrea', 'Ethiopia', 'Egypt', 'Libya', 'Sudan', 'Comoros', 'Madagascar', 'Mauritius', 'Seychelles', 'Burundi', 'Kenya', 'Malawi', 'Rwanda', 'Uganda', 'Swaziland', 'Zambia', 'Zimbabwe', 'Democratic Republic of the Congo'];
            break;
        case 'SADC':
            return ['Angola', 'Botswana', 'Democratic Republic of the Congo', 'Lesotho', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Namibia', 'Seychelles', 'South Africa', 'Swaziland', 'Tanzania', 'Zambia', 'Zimbabwe'];
            break;
        case 'ECOWAS':
            return ['Benin', 'Burkina Faso', 'Cape Verde', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Liberia', 'Mali', 'Niger', 'Nigeria', 'Senegal', 'Sierra Leone', 'Togo'];
            break;
        case 'EAC':
            return ['Burundi', 'Kenya', 'Rwanda', 'Tanzania', 'Uganda'];
            break;
        case 'UMA':
            return ['Algeria', 'Libya', 'Mauritania', 'Morocco', 'Tunisia'];
            break;
        case 'ECCAS':
            return ['Angola', 'Burundi', 'Cameroon', 'Central African Republic', 'Chad', 'Republic of the Congo', 'Democratic Republic of the Congo', 'Equatorial Guinea', 'Gabon', 'São Tomé and Príncipe', 'Rwanda'];
            break;
        default:
            return null;
    }
};