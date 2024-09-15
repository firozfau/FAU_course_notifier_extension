const htttps = 'https://'; 
const main_domain = 'www.studon.fau.de/';  
const studonText='studon';
const urlToCheck =htttps+main_domain+studonText;

const special_domain=main_domain+studonText
 

// find session data for  login information
function checkLoginStatus(callback)
 {

     
    chrome.cookies.getAll({ domain: 'www.studon.fau.de' }, (cookies) => {
      if (chrome.runtime.lastError) {
        console.error('Error fetching cookies:', chrome.runtime.lastError);
        callback(false); 
        return;
      }
  
      let isLoggedIn = false;
  
      cookies.forEach(cookie => {
        let parsedValue = cookie.value;
  
        
        if (typeof parsedValue === 'string' && parsedValue.includes('known_tools')) 
        {
          try {
            
            parsedValue = JSON.parse(parsedValue);
          } catch (e) {
            
            console.error(`Failed to parse JSON for cookie ${cookie.name}:`, e);
            return ;
          }
        }
  
        
        if (typeof parsedValue === 'object' && parsedValue !== null) {
          if ('known_tools' in parsedValue) {
            if (Array.isArray(parsedValue.known_tools) && parsedValue.known_tools.length === 0) {
              isLoggedIn = true;
              
            } else {
              isLoggedIn = false;
              
            }
          }
        }
      });
  
       
      callback(isLoggedIn);
    });
  }
 
 

 // check static string  from studon page
function checkLogoutPage(url, callback) 
{
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok for URL ${url}`);
            }
            return response.text();  
        })
        .then(data => {
            
            const isLogoutPage = data.includes(special_domain+'/logout.php');
            const isLogoutPage_short = data.includes('fau.de/studon/logout');

            
            if (isLogoutPage || isLogoutPage_short) {
                callback(true);  
            } else {
                callback(false); 
            }
        })
        .catch(error => {
            console.error(`Failed to fetch data for URL ${url}:`, error);
            callback(false); // Consider it not a logout page in case of error
        });
}




 




  const default_mgs = "This course is now open for registration. Please register as soon as possible, as the maximum number of participants is 18.";

 const key_data=['You cannot join the course','Kurs nicht','The maximum number of course members is exceeded.'];


 const checkCourseJoinPage = () => {

    resetNotificationFlag();

    chrome.storage.local.get('fau_urls', (result) => {
        const urls = result.fau_urls || [];
        
        if (urls.length > 0) {
            urls.forEach((url, index) => {
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Network response was not ok for URL ${url}`);
                        }
                        return response.text();  
                    })
                    .then(data => {
                        
                        const foundKeyPhrase = key_data.some(phrase => data.includes(phrase));

                        if (!foundKeyPhrase) 
                        {
                           
                            validationPass("FAU", default_mgs);
                        }

                    })
                    .catch(error => {
                        console.error(`Failed to fetch data for URL ${index + 1} (${url}):`, error);
                    });
            });
        } else {
            console.log('No URLs found.');
        }
    });
};






function  validationPass(title_course,message_details)
{ 
 

       checkLogoutPage(urlToCheck, (loginStatus) => {
        if (loginStatus) 
        {
            checkAndShowNotification(title_course, message_details);

        } else {
            checkAndShowNotification(title_course, "Your StudOn session has been terminated,  Please login to your StudOn in Chrome browser");
        }
    });
 

     

}



// Function to open a new tab
function openNewTab(action_url) {
    chrome.tabs.create({ url: action_url }, (tab) => {
      console.log('Opened new tab:', tab.id);  
    });
  }


  function checkAndShowNotification(title, message) 
  {
   
    chrome.storage.local.get(['notificationVisible'], (data) => {
   
  
      if (!data.notificationVisible)
      { 
          chrome.storage.local.set({ notificationVisible: true }, () => {
            showNotification(title, message);
          });
      }
  
    
  
  
  
    });
  }




function showNotification(title, message) 
{
  

  let titleWithSpaces = title.replace(/_/g, ' ');


  chrome.windows.create({
    url: chrome.runtime.getURL('full_screen.html'),
    type: 'popup',
    state: 'fullscreen',
    focused: true
  }, (window) => {
    chrome.storage.local.set({ modalTitle: titleWithSpaces, modalMessage: message });



  });
}

function resetNotificationFlag() {
    chrome.storage.local.set({ notificationVisible: false });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'resetNotificationFlag') {
      resetNotificationFlag();
    }
  });



// Set up an alarm to check the URL every minute
chrome.alarms.create('checkCurrentStatus', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'checkCurrentStatus') {
    checkCourseJoinPage();
  }
});