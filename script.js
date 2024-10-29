// const apiKey = 'vm3gsjxi1t29vrkjjdk82ap0pzh52vz4';

// //lấy campaign
// async function getCampaigns() {
//     try {
//         const response = await fetch('https://api.getresponse.com/v3/campaigns', {
//             headers: {
//                 'X-Auth-Token': `api-key ${apiKey}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         const data = await response.json();
//         console.log('Campaigns:', data);
//         return data;
//     } catch (error) {
//         console.error('Error fetching campaigns:', error.response.data);
//         return null
//     }
// }

// //lấy fromField
// async function getFromFields() {
//     try {
//         const response = await fetch('https://api.getresponse.com/v3/from-fields', {
//             headers: {
//                 'X-Auth-Token': `api-key ${apiKey}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         const data = await response.json();
//         console.log('From Fields:', data);
//         return data;
//     } catch (error) {
//         console.error('Error fetching fromFields:', error.response.data);
//         return null
//     }
// }


// // //lấy selectedSegments
// // async function getSelectedSegments() {
// //     try {
// //         const response = await fetch('https://api.getresponse.com/v3/segments', {
// //             headers: {
// //                 'X-Auth-Token': `api-key ${apiKey}`,
// //                 'Content-Type': 'application/json',
// //             },
// //         });
// //         const data = await response.json();
// //         console.log('Selected Segments:', data);
// //         return data;
// //     } catch (error) {
// //         console.error('Error fetching selectedSegments:', error.response.data);
// //         return null
// //     }
// // }
// // const responseSelectedSegments = getSelectedSegments();

// async function getContacts() {
//     try {
//         const response = await fetch('https://api.getresponse.com/v3/contacts', {
//             headers: {
//                 'X-Auth-Token': `api-key ${apiKey}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         const data = await response.json();
//         console.log('Contacts:', data);
//         return data;
//     } catch (error) {
//         console.error('Error fetching contacts:', error.response.data);
//         return []
//     }
// }

// const newLetterFetch = async () => {
//     const [responseContacts, responseCampaign, responseFromFields] = await Promise.all([
//         getContacts(), getCampaigns(), getFromFields()
//     ]);
//     const contactIds = responseContacts.length ? responseContacts.map(contact => contact.contactId) : []
//     const campaintId = responseCampaign ? responseCampaign[0]?.campaignId : "jSb2F"
//     const date = new Date();
//     date.setMinutes(date.getMinutes() + 1); 
//     const newDateTimeString = date.toISOString().slice(0, 19);
//     console.log(date);
//     console.log(newDateTimeString);
//     const dataNewLetter = {
//         content: {
//             html: "<h2>test 12</h2><p>Some test </p><a href='http://example.com'>Show  more</a>",
//             plain: "New Post"
//         },
//         flags: ["openrate"],
//         name: "New message",
//         type: "broadcast",
//         editor: "custom",
//         subject: "Annual report",
//         fromField: {
//             fromFieldId: responseFromFields ? responseFromFields[0]?.fromFieldId : "zX48q"
//         },
//         replyTo: {
//             fromFieldId: responseFromFields ? responseFromFields[0]?.fromFieldId : "zX48q"
//         },
//         campaign: {
//             campaignId: campaintId
//         },
//         sendSettings: {
//             selectedCampaigns: [campaintId],
//             selectedSegments: [],
//             selectedSuppressions: [],
//             excludedCampaigns: [],
//             excludedSegments: [],
//             // selectedContacts: [...contactIds],
//             timeTravel: "true",
//             perfectTiming: "false",
//             sendOn: {
//                 date: newDateTimeString,
//                 timeZone: {
//                     timeZoneId: 7
//                 }
//             }
//         }
//     }





//     try {
//         const response = await fetch('https://api.getresponse.com/v3/newsletters', {
//             method: 'POST',
//             headers: {
//                 'X-Auth-Token': `api-key ${apiKey}`,
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(dataNewLetter)
//         });
//         const data = await response.json();
//         console.log('New Letter:', data);
//         return data;
//     } catch (error) {
//         console.log(error)
//         return null
//     }
// }

// newLetterFetch()