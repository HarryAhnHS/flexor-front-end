import NotificationsList from '../components/NotificationsList';

const Notifications = () => {

  return (
    <>
      <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
        <section>
          <NotificationsList />
        </section>
      </div>
    </>
  );
};

export default Notifications;
