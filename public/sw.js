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
    tag: "unique-tag", // Use a unique tag to prevent duplicate notifications
    icon: icon,
    data: {
      url: url, // Replace with the desired URL for redirecting user to the desired page
    },
  };
  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const data = event.data.json();
  const url = data.data.url;

  event.waitUntil(clients.openWindow(url));
});