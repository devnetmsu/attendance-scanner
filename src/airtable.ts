import * as airtable from "airtable";

// example: { apiKey: "derp", baseId: "derp" }
const airtableConfig = require("../airtable.config.secret.json");

const base = new airtable({ apiKey: airtableConfig.apiKey }).base(
  airtableConfig.baseId
);

/**
 * Make an array containing potentially duplicate values into one with no duplicates.
 *
 * @param values an array of potentially non-unique strings
 * @return an array containing only unique values
 */
function makeArrayUnique(...values: string[]): string[] {
  const uniques = new Map();
  values.forEach(id => uniques.set(id, true));
  return Array.from(uniques.keys());
}

/**
 * Gets the contactId associated with a netId
 *
 * @param netId
 * @returns the contactId of the record with the provided netId, or undefined if none exists
 */
async function getContactIdForNetId(netId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    base("Contacts")
      .select({
        maxRecords: 1,
        view: "Main View",
        filterByFormula: `({Net ID} = '${netId}')`
      })
      .firstPage((err, records) => {
        if (!!err) {
          return reject(err);
        }

        if (records[0] === undefined) {
          return resolve(undefined);
        }

        return resolve(records[0].getId());
      });
  });
}

/**
 * Creates a new reocrd in the Contacts table with the given netid
 *
 * @param netId
 * @returns a string repreasenting the contactId
 */
async function createContact(netId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    base("Contacts").create(
      {
        "Preferred Email Address": `${netId}@msstate.edu`,
        "Net ID": netId
      },
      function(err, record) {
        if (err) {
          return reject(err);
        }
        return resolve(record.getId());
      }
    );
  });
}

/**
 * Retrieves the contactId for a known contact,
 * or creates a contact record if the contact is not already in the system
 *
 * @param netId
 */
async function getOrCreateContactId(netId: string): Promise<string> {
  const contactId = await getContactIdForNetId(netId);
  if (!!contactId) {
    return contactId;
  }

  const newContactId = await createContact(netId);
  return newContactId;
}

/**
 * Marks a contact as having attended a particular event
 *
 * @param netId
 * @param contactId
 */
async function markContactAsAttended(
  eventId: string,
  contactId: string
): Promise<void> {
  const attendees = await getCurrentEventAttendees(eventId);
  const newAttendees = makeArrayUnique(contactId, ...attendees);

  return new Promise<void>((resolve, reject) => {
    base("Events").update(
      eventId,
      {
        Attendees: newAttendees
      },
      function(err) {
        if (err) {
          return reject(err);
        }
        return resolve();
      }
    );
  });
}

/**
 * Get the current contactIds that are attending the specified event
 *
 * @param eventId
 * @returns an array of strings containing the contactIds of attendees
 */
async function getCurrentEventAttendees(eventId: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    base("Events").find(eventId, function(err, record) {
      if (err) {
        return reject(err);
      }

      return resolve(record.get("Attendees") || []);
    });
  });
}

/**
 * Adds a netId as an event attendee
 *
 * @param eventId
 * @param netId
 */
export async function markNetIdAsAttended(eventId: string, netId: string) {
  const contactId = await getOrCreateContactId(netId);
  await markContactAsAttended(eventId, contactId);
}
