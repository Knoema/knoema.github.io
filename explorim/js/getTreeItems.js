function getTreeItems(groupedLayers) {
    var items = [
        {
            title: "Economique et social",
            className: "infrastructures",
            children: [
                {
                    title: "Infrastructures",
                    children: [
                        {
                            title: "Routes"
                        },
                        {
                            title: "Projets actuels",
                            children: [
                                {
                                    title: "Education, Anticipated",
                                    children: groupedLayers["Education, Anticipated"]
                                },
                                {
                                    title: "Education, Finalised",
                                    children: groupedLayers["Education, Finalised"]
                                },
                                {
                                    title: "Electricity, Anticipated",
                                    children: groupedLayers["Electricity, Anticipated"]
                                },
                                {
                                    title: "Electricity, Finalised",
                                    children: groupedLayers["Electricity, Finalised"]
                                },
                                {
                                    title: "Health, Anticipated",
                                    children: groupedLayers["Health, Anticipated"]
                                },
                                {
                                    title: "Health, Finalised",
                                    children: groupedLayers["Health, Finalised"]
                                },
                                {
                                    title: "Other, Anticipated",
                                    children: groupedLayers["Other, Anticipated"]
                                },
                                {
                                    title: "Other, Finalised",
                                    children: groupedLayers["Other, Finalised"]
                                },
                                {
                                    title: "Social (Boutique Emel), Anticipated",
                                    children: groupedLayers["Social (Boutique Emel), Anticipated"]
                                },
                                {
                                    title: "Social (Boutique Emel), Finalised",
                                    children: groupedLayers["Social (Boutique Emel), Finalised"]
                                },
                                {
                                    title: "Water, Anticipated",
                                    children: groupedLayers["Water, Anticipated"]
                                },
                                {
                                    title: "Water, Finalised",
                                    children: groupedLayers["Water, Finalised"]
                                }
                            ]
                        },
                        {
                            title: "Télécommunications"
                        },
                        {
                            title: "Electricité"
                        },
                        {
                            title: "Les écoles par la ville",
                            children: [
                                {
                                    title: "École Primaire",
                                    children: groupedLayers["Primary Schools"]
                                },
                                {
                                    title: "École Secondaire",
                                    children: groupedLayers["Secondary Schools"]
                                }
                            ]
                        },
                        {
                            title: "Les points d'eau",
                            children: groupedLayers["Water Wells"]
                        },
                        {
                            title: "Les centres de santé",
                            children: groupedLayers["Health Centers"]
                        },
                        {
                            title: "Autres services publics"
                        }
                    ]
                },
                {
                    title: "Population",
                    children: [
                        {
                            title: "Démographie",
                            children: [
                                {
                                    title: "Population, mâle",
                                    children: groupedLayers["Demography. Male Population"]
                                },
                                {
                                    title: "Population, femelle",
                                    children: groupedLayers["Demography. Female Population"]
                                },
                                {
                                    title: "Population totale",
                                    children: groupedLayers["Demography. Total Population"]
                                }
                            ]
                        },
                        {
                            //title: "RGPH",
                            title: "Recensement Général de la Population et de l'Habitat (RGPH)",
                            children: [
                                {
                                    title: "Habitat",
                                    children: groupedLayers["Habitat"]
                                },
                                {
                                    title: "Équipments de la maison",
                                    children: groupedLayers["Équipments de la maison"]
                                },
                                {
                                    title: "Cuisine eclairage eau",
                                    children: groupedLayers["Cuisine eclairage eau"]
                                },
                                {
                                    title: "Assainissement",
                                    children: groupedLayers["Assainissement"]
                                }
                            ]
                        },
                        {
                            title: "Éducation",
                            children: [
                                {
                                    name: "Bac résultats"
                                },
                                {
                                    name: "Bepc résultats"
                                }
                            ]
                        },
                        {
                            title: "Santé"
                        }
                    ]
                }
            ]
        },
        {
            title: "Zone de vie",
            className: "zone-de-ville",
            children: [
                {
                    title: "Pêches",
                    children: groupedLayers["Peches"]
                },
                {
                    title: "Immigration illégale"
                },
                {
                    title: "Zones agricoles",
                    children: groupedLayers['Agriculture potentielle']
                },
                {
                    title: "Elevage"
                },
                {
                    title: "Végétation"
                },
                {
                    title: "Trafic",
                    children: [
                        {
                            title: "Humains",
                            children: [
                                {
                                    title: "Esclavage, employé"
                                },
                                {
                                    title: "Esclavage, sexe"
                                }
                            ]
                        },
                        {
                            title: "Stupéfiants"
                        },
                        {
                            title: "Armes"
                        }
                    ]
                },
                {
                    title: "Terrorisme et les conflits",
                    children: groupedLayers["Terrorisme et les conflits"]
                }
            ]
        },
        {
            title: "Pluies",
            className: "climate",
            children: [
                {
                    title: 'Stations de pluie',
                    children: groupedLayers['Stations de pluie']
                },
                {
                    title: 'Historique',
                    children: groupedLayers['Historique']
                },
                {
                    title: "Prévoir",
                    children: [
                        {
                            title: "Prévision des précipitations de 10 jours (mm)"
                        }
                    ]
                }
            ]
        },
        {
            title: "Politique",
            className: "politics",
            children: [
                {
                    title: "Mahadras"
                },
                {
                    title: "Tribus",
                    children: groupedLayers["Tribus"]
                },
                {
                    title: "Social",
                    children: [
                        {
                            title: "Forces armées"
                        },
                        {
                            title: "Cadres"
                        },
                        {
                            title: "Fonctionnaires",
                            children: [
                                {
                                    title: "Fonctionnaires par lieu de inscription",
                                    children: groupedLayers["Fonctionnaires. Code Inscription"]
                                },
                                {
                                    title: "Fonctionnaires par lieu de naissance",
                                    children: groupedLayers["Fonctionnaires. Code Naissance"]
                                }
                            ]
                        },
                        {
                            title: "Hommes d'affaires"
                        },
                        {
                            title: "Acteurs politiques"
                        },
                        {
                            title: "Notable"
                        }
                    ]
                },
                {
                    title: "Élections",
                    children: [
                        {
                            title: "Résultats Elections",
                            children: [
                                {
                                    title: "Présidentielle 2014",
                                    children: [
                                        {
                                            title: "Mohamed Ould Abdel Aziz",
                                            children: groupedLayers["Presidential Election. Mohamed Ould Abdel Aziz"]
                                        },
                                        {
                                            title: "Boïdiel Ould Houmeit",
                                            children: groupedLayers["Presidential Election. Boïdiel Ould Houmeit"]
                                        },
                                        {
                                            title: "Laila Maryam Mint Moulaye Idriss",
                                            children: groupedLayers["Presidential Election. Laila Maryam Mint Moulaye Idriss"]
                                        },
                                        {
                                            title: "Biram Dah Abeid",
                                            children: groupedLayers["Presidential Election. Biram Dah Abeid"]
                                        },
                                        {
                                            title: "Ibrahima Moctar Sarr",
                                            children: groupedLayers["Presidential Election. Ibrahima Moctar Sarr"]
                                        },
                                        {
                                            title: "Votants Total",
                                            children: groupedLayers["Presidential Election. Votants Total"]
                                        },
                                        {
                                            title: "Inscrits Total",
                                            children: groupedLayers["Presidential Election. Votants Total"]
                                        }
                                    ]
                                },
                                {
                                    title: "2013 Parlementaire",
                                    children: [
                                        {
                                            title: "Total",
                                            children: groupedLayers["Parliamentary Election. Total"]
                                        },
                                        {
                                            title: "APP + Tawassul",
                                            children: groupedLayers["Parliamentary Election. APP + Tawassul"]
                                        },
                                        {
                                            title: "Alliance for Democracy in Mauritania (ADM)",
                                            children: groupedLayers["Parliamentary Election. Alliance for Democracy in Mauritania (ADM)"]
                                        },
                                        {
                                            title: "Alliance for Justice and Democracy / Movement for Renovation (AJD / MR)",
                                            children: groupedLayers["Parliamentary Election. Alliance for Justice and Democracy / Movement for Renovation (AJD / MR)"]
                                        },
                                        {
                                            title: "APP + Tawassul",
                                            children: groupedLayers["Parliamentary Election. APP + Tawassul"]
                                        },
                                        {
                                            title: "Popular Front (FP)",
                                            children: groupedLayers["Parliamentary Election. Popular Front (FP)"]
                                        },
                                        {
                                            title: "The People's Progressive Alliance (APP)",
                                            children: groupedLayers["Parliamentary Election. The People's Progressive Alliance (APP)"]
                                        },
                                        {
                                            title: "El Islah Party",
                                            children: groupedLayers["Parliamentary Election. El Islah Party"]
                                        },
                                        {
                                            title: "Ravah Party",
                                            children: groupedLayers["Parliamentary Election. Ravah Party"]
                                        },
                                        {
                                            title: "Party of Unity and Development (PUD)",
                                            children: groupedLayers["Parliamentary Election. Party of Unity and Development (PUD)"]
                                        },
                                        {
                                            title: "Party of the Union for the Republic (UPR)",
                                            children: groupedLayers["Parliamentary Election. Party of the Union for the Republic (UPR)"]
                                        },
                                        {
                                            title: "Dignity and Action Party (PDA)",
                                            children: groupedLayers["Parliamentary Election. Dignity and Action Party (PDA)"]
                                        },
                                        {
                                            title: "Democratic Party of the People (PPD)",
                                            children: groupedLayers["Parliamentary Election. Democratic Party of the People (PPD)"]
                                        },
                                        {
                                            title: "El Karam Party",
                                            children: groupedLayers["Parliamentary Election. El Karam Party"]
                                        },
                                        {
                                            title: "EL VADILA Party",
                                            children: groupedLayers["Parliamentary Election. EL VADILA Party"]
                                        },
                                        {
                                            title: "EL WIAM Party",
                                            children: groupedLayers["Parliamentary Election. EL WIAM Party"]
                                        },
                                        {
                                            title: "Rally for Unity Party (MAJD)",
                                            children: groupedLayers["Parliamentary Election. Rally for Unity Party (MAJD)"]
                                        },
                                        {
                                            title: "Republican Party for Democracy and Renewal (RDRP)",
                                            children: groupedLayers["Parliamentary Election. Republican Party for Democracy and Renewal (RDRP)"]
                                        },
                                        {
                                            title: "RibatDémocratique Party and Social (RDS)",
                                            children: groupedLayers["Parliamentary Election. RibatDémocratique Party and Social (RDS)"]
                                        },
                                        {
                                            title: "Sawab Party",
                                            children: groupedLayers["Parliamentary Election. Sawab Party"]
                                        },
                                        {
                                            title: "Third Generation Party (PTG)",
                                            children: groupedLayers["Parliamentary Election. Third Generation Party (PTG)"]
                                        },
                                        {
                                            title: "National Rally for Reform and Development (tawassul)",
                                            children: groupedLayers["Parliamentary Election. National Rally for Reform and Development (tawassul)"]
                                        },
                                        {
                                            title: "Democratic Renewal (RD)",
                                            children: groupedLayers["Parliamentary Election. Democratic Renewal (RD)"]
                                        },
                                        {
                                            title: "Sawab + WIAM",
                                            children: groupedLayers["Parliamentary Election. Sawab + WIAM"]
                                        },
                                        {
                                            title: "Startle Youth for the Nation (SURSAUT)",
                                            children: groupedLayers["Parliamentary Election. Startle Youth for the Nation (SURSAUT)"]
                                        },
                                        {
                                            title: "Union of the Democratic Centre (U.C.D)",
                                            children: groupedLayers["Parliamentary Election. Union of the Democratic Centre (U.C.D)"]
                                        },
                                        {
                                            title: "Union for Democracy and Progress (UDP)",
                                            children: groupedLayers["Parliamentary Election. Union for Democracy and Progress (UDP)"]
                                        }
                                    ]
                                },
                                {
                                    title: "2013 Municipale",
                                    children: [

                                    ]
                                }
                            ]
                        },
                        {
                            title: "Listes électorales",
                            children: [
                                {
                                    title: "Les députés",
                                    children: groupedLayers["Liste électorale. Number of MPs"]
                                },
                                {
                                    title: "Conseillers",
                                    children: groupedLayers["Liste électorale. Number of councilors"]
                                },
                                {
                                    title: "Maires",
                                    children: groupedLayers["Liste électorale. Number of mayors"]
                                },
                                {
                                    title: "Bureaux de vote",
                                    children: groupedLayers["Liste électorale. Number of polling stations"]
                                },
                                {
                                    title: "Électeurs",
                                    children: groupedLayers["Liste électorale. Number of voters"]
                                },
                                {
                                    title: "Poids",
                                    children: groupedLayers["Liste électorale. Weight"]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];
    return items;
}
