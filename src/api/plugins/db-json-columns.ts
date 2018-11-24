export function JSONColumns(Bookshelf) {
  const Model = Bookshelf.Model.prototype;
  const client = Bookshelf.knex.client.config.client;
  const parseOnFetch = client === 'sqlite' || client === 'sqlite3' || client === 'mysql';

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize() {
      if (!this.constructor.jsonColumns) {
        return Model.initialize.apply(this, arguments);
      }

      // Stringify JSON columns before model is saved.
      this.on('saving', stringify.bind(this));

      // Parse JSON columns after model is saved.
      this.on('saved', parse.bind(this));

      if (parseOnFetch) {
        // Parse JSON columns after model is fetched.
        this.on('fetched', parse.bind(this));
      }

      return Model.initialize.apply(this, arguments);
    },
    save(key, value, options) {
      if (!this.constructor.jsonColumns) {
        return Model.save.apply(this, arguments);
      }

      // Handle arguments as Bookshelf.
      let attributes;

      if (key === null || typeof key === 'object') {
        attributes = key || {};
        options = value ? { ...value } : {};
      } else {
        (attributes = {})[key] = value;
        options = options ? { ...options } : {};
      }

      // Only handle arguments with `patch` option.
      if (!options.patch) {
        return Model.save.apply(this, arguments);
      }

      // Stringify JSON columns.
      Object.keys(attributes).forEach(attribute => {
        if (this.constructor.jsonColumns.includes(attribute) && attributes[attribute]) {
          attributes[attribute] = JSON.stringify(attributes[attribute]);
        }
      });

      return Model.save.call(this, attributes, options)
        .then(model => {
          // Parse JSON columns.
          Object.keys(attributes).forEach(attribute => {
            if (this.constructor.jsonColumns.includes(attribute) && model.attributes[attribute]) {
              model.attributes[attribute] = JSON.parse(model.attributes[attribute]);
            }
          });

          return model;
        });
    }
  });

  if (!parseOnFetch) {
    return;
  }

  const Collection = Bookshelf.Collection.prototype;

  Bookshelf.Collection = Bookshelf.Collection.extend({
    initialize() {
      if (!this.model.jsonColumns) {
        return Collection.initialize.apply(this, arguments);
      }

      // Parse JSON columns after collection is fetched.
      this.on('fetched', collection => {
        collection.models.forEach(model => {
          parse.apply(model);
        });
      });

      return Collection.initialize.apply(this, arguments);
    }
  });
}

function stringify(model, attributes, options) {
  // Do not stringify with `patch` option.
  if (options && options.patch) {
    return;
  }

  // Mark json columns as stringfied.
  options.parseJsonColumns = true;

  this.constructor.jsonColumns.forEach(column => {
    if (this.attributes[column]) {
      this.attributes[column] = JSON.stringify(this.attributes[column]);
    }
  });
}

function parse(model, response) {
  const options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (options.patch) {
    return;
  }

  if (!options.parseJsonColumns && options.query && options.query._method !== 'select') {
    return;
  }

  this.constructor.jsonColumns.forEach(column => {
    if (this.attributes[column]) {
      try {
        this.attributes[column] = JSON.parse(this.attributes[column]);
      } catch (e) {
        this.attributes[column] = String(this.attributes[column])
          .replace(/\\/g, '')
          .replace(/(?<!:|: )"(?=[^"]*?"(( [^:])|([,}])))/g, '\\"');
        try {
          this.attributes[column] = JSON.parse(this.attributes[column]);
        } catch (e) {
          throw new Error(e);
        }
      }
    }
  });
}
