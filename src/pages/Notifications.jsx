import Navbar from '../components/Navbar';
import NotificationsList from '../components/NotificationsList';

const Notifications = () => {

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Notifications</h1>
        <section>
          <NotificationsList />
        </section>
      </div>
    </>
  );
};

export default Notifications;
