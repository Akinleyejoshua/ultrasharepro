self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const title = data.title;
  const body = data.body;
  const icon = data.icon;
  const url = data.data.url;

  const notificationOptions = {
    body: body,
    icon: icon,
    tag: "notification",
    data: {
      id: Math.floor(Math.random() * 10000000000000),
      url: url, // Replace with the desired URL for redirecting user to the desired page
    },
    };
    
    self.addEventListener("notificationclick", function (event) {
      event.waitUntil(clients.openWindow(url));
      event.notification.close();
      
    });

  //   fs.writeFileSync("log.txt", `${url}`, { flag: "w" });
  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

;
