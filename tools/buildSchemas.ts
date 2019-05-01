// Build time tool used to prepare the source code for the sanitization and
// validation schemas. Removes the portion of the schemas that only relates to
// server side data.

import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import stringify from 'stringify-object';
import regexRewritePattern from 'regexpu-core';

// Copied over from @groupby/wisdom-common to avoid dependency
const ISO_8601_REGEX = /(\d{4})-(0[1-9]|1[0-2]|[1-9])-(\3([12]\d|0[1-9]|3[01])|[1-9])[tT\s]([01]\d|2[0-3]):(([0-5]\d)|\d):(([0-5]\d)|\d)([.,]\d+)?([zZ]|([+-])([01]\d|2[0-3]|\d):(([0-5]\d)|\d))$/;
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SHA1_HEX_REGEX = /^[0-9a-f]{40}$/;
const WHITELIST_STRIPING_REGEX = new RegExp(regexRewritePattern('[^\\p{L}\\p{Mn}\\p{Mc}\\p{Sc}\\p{N}\\p{Pd}\\p{Pi}\\p{Pf}\\p{Pc}\\p{Po}]', 'u', {
  unicodePropertyEscape: true,
  useUnicodeFlag: false,
}), 'g');
const BLACKLIST_STRIPING_REGEX = new RegExp(regexRewritePattern('[\\p{Me}\\p{C}<>=;(){}\\[\\]?]', 'u', {
  unicodePropertyEscape: true,
  useUnicodeFlag: false,
}), 'g');
const regex = {
  ISO_8601: ISO_8601_REGEX,
  UUID_V4: UUID_V4_REGEX,
  ALPHA_NUM_LOWERCASE: /^[0-9a-z]+$/,
  ALPHA_NUM: /^[0-9a-z]+$/i,
  SHA1_HEX: SHA1_HEX_REGEX,
  WHITELIST_STRIPING_REGEX,
  BLACKLIST_STRIPING_REGEX,
};

import {
  validation as addToCartValidation,
  sanitization as addToCartSanitization,
} from '@groupby/beacon-models/addToCart/schema';
import {
  validation as viewCartValidation,
  sanitization as viewCartSanitization,
} from '@groupby/beacon-models/viewCart/schema';
import {
  validation as removeFromCartValidation,
  sanitization as removeFromCartSanitization,
} from '@groupby/beacon-models/removeFromCart/schema';
import {
  validation as orderValidation,
  sanitization as orderSanitization,
} from '@groupby/beacon-models/order/schema';
import {
  validation as autoSearchValidation,
  sanitization as autoSearchSanitization,
} from '@groupby/beacon-models/autoSearch/schema';
import {
  validation as autoMoreRefinementsValidation,
  sanitization as autoMoreRefinementsSanitization,
} from '@groupby/beacon-models/autoMoreRefinements/schema';
import {
  validation as searchValidation,
  sanitization as searchSanitization,
} from '@groupby/beacon-models/search/schema';
import {
  validation as viewProductValidation,
  sanitization as viewProductSanitization,
} from '@groupby/beacon-models/viewProduct/schema';

const allEventSchemas = {
  addToCart: { validation: addToCartValidation, sanitization: addToCartSanitization },
  viewCart: { validation: viewCartValidation, sanitization: viewCartSanitization },
  removeFromCart: { validation: removeFromCartValidation, sanitization: removeFromCartSanitization },
  order: { validation: orderValidation, sanitization: orderSanitization },
  autoSearch: { validation: autoSearchValidation, sanitization: autoSearchSanitization },
  autoMoreRefinements: { validation: autoMoreRefinementsValidation, sanitization: autoMoreRefinementsSanitization },
  search: { validation: searchValidation, sanitization: searchSanitization },
  viewProduct: { validation: viewProductValidation, sanitization: viewProductSanitization },
};

const distPath = path.join(__dirname, '../src');
const schemaPath = `${distPath}/schemas`;

const stringifyOptions = {
  indent: '  ',
  singleQuotes: true,
};

const generateFullSchemas = (withSanitization: boolean) => (eventType: string) => {
  const eventName = _.camelCase(eventType);

  console.log(`Building${withSanitization ? '' : ' validation'} schemas for eventType: ${eventType}`);

  const schema = allEventSchemas[eventType as keyof typeof allEventSchemas];

  cleanAndWriteSchemas(schema, eventName, withSanitization);
};

const cleanAndWriteSchemas = (schema: { validation: any, sanitization: any }, eventName: string, withSanitization: boolean) => {
  // Remove generated validation
  if (eventName !== 'invalid') {
    if (_.has(schema, 'validation.properties.visit.properties.generated')) {
      delete schema.validation.properties.visit.properties.generated;
    }

    if (_.has(schema, 'sanitization.properties.visit.properties.generated')) {
      delete schema.sanitization.properties.visit.properties.generated;
    }
  }

  // Remove these from the invalid event schemas
  delete schema.validation.properties.dateReceivedAsInvalid;
  if (_.has(schema, 'sanitization.properties.dateReceivedAsInvalid')) {
    delete schema.sanitization.properties.dateReceivedAsInvalid;
  }

  // Do not require ID field on the event from the browser
  delete schema.validation.properties.id;
  if (_.has(schema, 'sanitization.properties.id')) {
    delete schema.sanitization.properties.id;
  }

  const finalSchema = withSanitization ? schema : { validation: removeNumericTypes(schema.validation) };

  fs.writeFileSync(
    `${schemaPath}/${eventName}${withSanitization ? '' : '-validate'}.ts`,
    `var utils = require('./utils'); const BLACKLIST_STRIPING_REGEX = utils.regex.BLACKLIST_STRIPING_REGEX; ${'\n'}export default ${stringify(finalSchema, stringifyOptions)}`,
  );
};

if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

if (!fs.existsSync(schemaPath)) {
  fs.mkdirSync(schemaPath);
}

const removeNumericTypes = (schema: any) => {
  if (schema.type && (schema.type === 'number' || schema.type === 'integer')) {
    delete schema.type;
  }

  _.map(schema, (value) => {
    if (_.isObject(value)) {
      removeNumericTypes(value);
    }
  });

  return schema;
};

// Strip the portions of the schemas that are generated on the backend

const fullEventTypes = [
  'addToCart',
  'viewCart',
  'removeFromCart',
  'order',
  'search',
  'viewProduct',
  'autoSearch',
  'autoMoreRefinements',
];

fs.writeFileSync(`${schemaPath}/utils.ts`, `module.exports = ${stringify({ regex }, stringifyOptions)};`);
fs.writeFileSync(`${schemaPath}/DO_NOT_TOUCH__ALL_AUTOGENERATED`, `Don't do it.\n\nThese are auto-generated by the "npm run generateSchemas" script.`);

_.forEach(fullEventTypes, generateFullSchemas(true));
_.forEach(fullEventTypes, generateFullSchemas(false));
