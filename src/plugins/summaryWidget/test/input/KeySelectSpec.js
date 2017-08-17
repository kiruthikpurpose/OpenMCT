define(['../../src/input/KeySelect'], function (KeySelect) {
    describe('A select for choosing composition object properties', function () {
        var mockConfig, mockBadConfig, mockManager, keySelect, mockMetadata, mockObjectSelect;
        beforeEach(function () {
            mockConfig = {
                object: 'object1',
                key: 'a'
            };

            mockBadConfig = {
                object: 'object1',
                key: 'someNonexistentKey'
            };

            mockMetadata = {
                object1: {
                    a: {
                        name: 'A'
                    },
                    b: {
                        name: 'B'
                    }
                },
                object2: {
                    alpha: {
                        name: 'Alpha'
                    },
                    beta: {
                        name: 'Beta'
                    }
                },
                object3: {
                    a: {
                        name: 'A'
                    }
                }
            };

            mockManager = jasmine.createSpyObj('mockManager', [
                'on',
                'metadataLoadCompleted',
                'triggerCallback',
                'getComposition'
            ]);

            mockObjectSelect = jasmine.createSpyObj('mockObjectSelect', [
                'on',
                'triggerCallback'
            ]);

            mockObjectSelect.on = function (event, callback) {
                this.callbacks = this.callbacks || {};
                this.callbacks[event] = callback;
            };

            mockObjectSelect.triggerCallback = function (event, key) {
                this.callbacks[event](key);
            };

            mockManager.on = function (event, callback) {
                this.callbacks = this.callbacks || {};
                this.callbacks[event] = callback;
            };

            mockManager.triggerCallback = function (event) {
                this.callbacks[event]();
            };

            mockManager.getTelemetryMetadata = function (key) {
                return mockMetadata[key];
            };

        });

        it('waits until the metadata fully loads to populate itself', function () {
            mockManager.metadataLoadCompleted.andReturn(false);
            keySelect = new KeySelect(mockConfig, mockObjectSelect, mockManager);
            expect(keySelect.getSelected()).toEqual('');
        });

        it('populates itself with metadata on a metadata load', function () {
            mockManager.metadataLoadCompleted.andReturn(false);
            keySelect = new KeySelect(mockConfig, mockObjectSelect, mockManager);
            mockManager.triggerCallback('metadata');
            expect(keySelect.getSelected()).toEqual('a');
        });

        it('populates itself with metadata if metadata load is already complete', function () {
            mockManager.metadataLoadCompleted.andReturn(true);
            keySelect = new KeySelect(mockConfig, mockObjectSelect, mockManager);
            expect(keySelect.getSelected()).toEqual('a');
        });

        it('clears its selection state if the property in its config is not in its object', function () {
            mockManager.metadataLoadCompleted.andReturn(true);
            keySelect = new KeySelect(mockBadConfig, mockObjectSelect, mockManager);
            expect(keySelect.getSelected()).toEqual('');
        });

        it('populates with the appropriate options when its linked object changes', function () {
            mockManager.metadataLoadCompleted.andReturn(true);
            keySelect = new KeySelect(mockConfig, mockObjectSelect, mockManager);
            mockObjectSelect.triggerCallback('change', 'object2');
            keySelect.setSelected('alpha');
            expect(keySelect.getSelected()).toEqual('alpha');
        });

        it('clears its selected state on change if the field is not present in the new object', function () {
            mockManager.metadataLoadCompleted.andReturn(true);
            keySelect = new KeySelect(mockConfig, mockObjectSelect, mockManager);
            mockObjectSelect.triggerCallback('change', 'object2');
            expect(keySelect.getSelected()).toEqual('');
        });

        it('maintains its selected state on change if field is present in new object', function () {
            mockManager.metadataLoadCompleted.andReturn(true);
            keySelect = new KeySelect(mockConfig, mockObjectSelect, mockManager);
            mockObjectSelect.triggerCallback('change', 'object3');
            expect(keySelect.getSelected()).toEqual('a');
        });
    });
});
