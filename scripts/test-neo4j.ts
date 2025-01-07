// scripts/test-neo4j.ts

import { getNeo4jClient } from '../lib/neo4j/client';
import { Transaction } from 'neo4j-driver';

async function testNeo4j() {
  const driver = getNeo4jClient();
  const session = driver.session();

  try {
    console.log('Testing Neo4j connection...');

    // Test basic connection and write operation
    const writeResult = await session.writeTransaction(async (tx: Transaction) => {
      const result = await tx.run(
        `CREATE (n:TestNode {
          id: randomUUID(),
          message: $message,
          timestamp: datetime()
        }) RETURN n`,
        { message: 'Test connection successful!' }
      );
      return result.records[0].get('n').properties;
    });

    console.log('Write test successful:', writeResult);

    // Test read operation
    const readResult = await session.readTransaction(async (tx: Transaction) => {
      const result = await tx.run(
        'MATCH (n:TestNode) RETURN n ORDER BY n.timestamp DESC LIMIT 1'
      );
      return result.records[0].get('n').properties;
    });

    console.log('Read test successful:', readResult);

    // Clean up test node
    await session.writeTransaction(async (tx: Transaction) => {
      await tx.run('MATCH (n:TestNode) DELETE n');
      console.log('Cleanup successful');
    });

    console.log('All Neo4j tests passed successfully! ✓');

  } catch (error) {
    console.error('Neo4j test failed:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

// Run the test
testNeo4j()
  .catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
  });