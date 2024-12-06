const { connect, StringCodec } = require('nats');
const dotenv = require('dotenv');

dotenv.config();

// Mock data based on the DBML data structure
function getMockedBrokerData() {
  return {
    broker_id: Math.floor(Math.random() * 1000000),
    identification: "123456789",
    identification_type: "CPF",
    susep: Math.floor(Math.random() * 10000000000000000),
    contact: "john.doe@example.com",
    broker_details_id: "details_1",
    products: ["product_1", "product_2", "product_3"],
    insurers: ["insurer_1", "insurer_2"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Start the NATS server
async function startServer() {
  try {
    const nc = await connect({ servers: 'nats://test-nats-nats.chihuahua-bramble.ts.net:4222' });
    console.log('Connected to NATS server');

    const sc = StringCodec();
    const subject = 'brokers.get';

    // Subscribe to the subject and respond with mocked JSON data
    const sub = nc.subscribe(subject, { queue: 'workers' });
    console.log(`Listening on subject: ${subject}`);

    for await (const message of sub) {
      console.log('Received request for broker data');

      const mockData = Array(10).fill(null).map(() => getMockedBrokerData());
      const response = JSON.stringify(mockData);

      if (message.reply) {
        nc.publish(message.reply, sc.encode(response));
        console.log(`Replied with: ${response}`);
      } else {
        console.log('No reply subject provided');
      }
    }
  } catch (err) {
    console.error('Error starting NATS server:', err);
  }
}

// Start the server
startServer();
